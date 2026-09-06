import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { verifyOwnEmailAccess } from "@/lib/ownDataAuth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { status, email } = await verifyOwnEmailAccess(req);
    if (status === "unauthenticated")
      return NextResponse.json({ error: "Authentication required", message: "Authentication required" }, { status: 401 });
    if (status === "missing-email")
      return NextResponse.json({ error: "Email is required", message: "Email is required" }, { status: 400 });
    if (status === "forbidden")
      return NextResponse.json({ error: "You can only check your own applications", message: "You can only check your own applications" }, { status: 403 });

    const db = await connect();
    const snapshot = await db
      .collection("formData")
      .where("Email", "==", email)
      .select("Department")
      .get();
    const submittedDepartments = snapshot.docs.map((doc) => doc.data().Department).filter(Boolean);

    return NextResponse.json({ count: snapshot.size, submittedDepartments }, { status: 200 });
  } catch (error) {
    console.error("Error checking applications:", error);
    return NextResponse.json(
      {
        error: "Internal server error inside check-applications dir",
        message: "Internal server error inside check-applications dir",
      },
      { status: 500 }
    );
  }
}
