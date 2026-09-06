import { connect, serializeApplicant } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/authorize";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { status } = await getAdminSession();
    if (status === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized", message: "Unauthorized" }, { status: 401 });
    }
    if (status === "forbidden") {
      return NextResponse.json({ error: "Forbidden", message: "Forbidden" }, { status: 403 });
    }

    const db = await connect();
    const snapshot = await db.collection("formData").get();
    const applicants = snapshot.docs.map((doc) => serializeApplicant(doc));

    return NextResponse.json({ applicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants", message: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}

