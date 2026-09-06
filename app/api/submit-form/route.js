import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Authentication required", message: "Authentication required" }),
        { status: 401 }
      );
    }

    const user = session.user;
    const userId = user.id;
    const userEmail = user.email;

    const rateLimit = await checkRateLimit({
      key: `submit-form:${userId}`,
      limit: 10,
      windowSeconds: 60,
    });
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment and try again.", message: "Too many requests. Please wait a moment and try again." }),
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const deadline = new Date(
      process.env.SUBMISSION_DEADLINE || "2026-08-23T23:59:59+05:30"
    );
    if (new Date() > deadline)
      return new Response(
        JSON.stringify({
          error: "The submission deadline has passed",
          message: "The submission deadline has passed"
        }),
        { status: 403 }
      );
                  

    const db = await connect();
    const data = await req.json();

    const { Department, Questions, ...formFields } = data;

    const regNoRegex = /^\d{2}[A-Z]{3}\d{4}$/;
    if (formFields.RegistrationNumber && !regNoRegex.test(formFields.RegistrationNumber)) {
      return new Response(
        JSON.stringify({
          error: "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)",
          message: "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)",
        }),
        { status: 400 }
      );
    }

    const departmentSlug = slugify(Department);
    const profileRef = db.collection("applicantProfiles").doc(userId);
    const responseRef = db.collection("formData").doc(`${userId}_${departmentSlug}`);

    try {
      await db.runTransaction(async (tx) => {
        const profileSnap = await tx.get(profileRef);
        const profile = profileSnap.exists ? profileSnap.data() : { departments: [] };
        const currentDepartments = Array.isArray(profile?.departments)
          ? profile.departments
          : [];

        if (currentDepartments.includes(departmentSlug)) {
          throw new Error("ALREADY_APPLIED_TO_DEPARTMENT");
        }
        if (currentDepartments.length >= 2) {
          throw new Error("MAX_APPLICATIONS_REACHED");
        }

        tx.set(
          profileRef,
          {
            departments: [...currentDepartments, departmentSlug],
            email: userEmail,
          },
          { merge: true }
        );

        tx.set(responseRef, {
          userId,
          Email: userEmail,
          Department,
          Questions,
          ...formFields,
          createdAt: FieldValue.serverTimestamp(),
        });
      });
    } catch (txError) {
      if (txError.message === "ALREADY_APPLIED_TO_DEPARTMENT") {
        return new Response(
          JSON.stringify({
            error: `You have already submitted an application for ${Department}`,
            message: `You have already submitted an application for ${Department}`,
          }),
          { status: 400 }
        );
      }
      if (txError.message === "MAX_APPLICATIONS_REACHED") {
        return new Response(
          JSON.stringify({
            error: "Remember that you can only submit upto 2 unique applications",
            message: "Remember that you can only submit upto 2 unique applications",
          }),
          { status: 400 }
        );
      }
      throw txError;
    }

    return new Response(
      JSON.stringify({
        message: "Form submitted successfully!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return new Response(JSON.stringify({ error: "Error submitting form", message: "Error submitting form" }), {
      status: 500,
    });
  }
}

