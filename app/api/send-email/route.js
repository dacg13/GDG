require("dotenv").config();
import nodemailer from "nodemailer";
import { reviews } from "@/constants";
import { getAdminSession } from "@/lib/authorize";
import { connect } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const transporter = nodemailer.createTransport({
    service: "gmail", // or your preferred email service
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function POST(req) {
    const { session, status } = await getAdminSession();
    if (status === "unauthenticated") {
        return new Response(
            JSON.stringify({ error: "Unauthorized", message: "Unauthorized" }),
            { status: 401 }
        );
    }
    if (status === "forbidden") {
        return new Response(
            JSON.stringify({ error: "Forbidden", message: "Forbidden" }),
            { status: 403 }
        );
    }

    const rateLimit = await checkRateLimit({
        key: `send-email:${session.user.id}`,
        limit: 5,
        windowSeconds: 60,
    });
    if (!rateLimit.allowed) {
        return new Response(
            JSON.stringify({ error: "Too many requests. Please wait a moment and try again.", message: "Too many requests. Please wait a moment and try again." }),
            { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
        );
    }

    const { recipients, payloadData } = await req.json();

    if (!recipients || recipients.length === 0) {
        return new Response(
            JSON.stringify({ error: "No recipients provided", message: "No recipients provided" }),
            { status: 400 }
        );
    }

    try {
        const db = await connect();

        const results = await Promise.allSettled(
            recipients.map(async (recipient) => {
                // Verify recipient exists in formData
                const recipientQuery = await db
                    .collection("formData")
                    .where("Email", "==", recipient.Email)
                    .limit(1)
                    .get();

                if (recipientQuery.empty) {
                    throw new Error(`Recipient not found in formData: ${recipient.Email}`);
                }

                let depart = recipient.Department;
                if (depart === "Video Editing") {
                    depart = "Photography";
                }
                const dept = reviews.find((item) => item.name === depart);

                if (!dept) {
                    throw new Error(`Department not found: ${recipient.Department}`);
                }

                let deptName = dept.name;
                if (
                    deptName === "Web Development" ||
                    deptName === "App Development"
                ) {
                    deptName = "Development Department";
                }

                if (deptName === "Photography" || deptName === "Video Editing") {
                    deptName = "Photography & Video Editing Department";
                }

                let generalTemp = `
                <div>
                    ${payloadData.body}
                </div>
                `;

                generalTemp = generalTemp.replace(/#name/g, recipient.Name);
                generalTemp = generalTemp.replace(/#dept/g, deptName);

                const mailOptions = {
                    from: process.env.EMAIL_USERNAME,
                    to: recipient.Email,
                    subject: payloadData.subject,
                    html: generalTemp,
                };

                await transporter.sendMail(mailOptions);
                return recipient.Email;
            })
        );

        const sent = [];
        const failed = [];

        results.forEach((result, idx) => {
            if (result.status === "fulfilled") {
                sent.push(result.value);
            } else {
                failed.push({
                    email: recipients[idx]?.Email || "Unknown",
                    reason: result.reason?.message || "Unknown error",
                });
            }
        });

        return new Response(
            JSON.stringify({ message: "Email processing complete", sent, failed }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to send emails", message: "Failed to send emails" }),
            { status: 500 }
        );
    }
}

