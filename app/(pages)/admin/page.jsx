import React from "react";
import { connect, serializeFirestoreData } from "@/lib/db";
import AdminContent from "@/components/AdminContent";
import { getAdminSession } from "@/lib/authorize";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { status } = await getAdminSession();
  if (status !== "ok") redirect("/");

  const db = await connect();
  const snapshot = await db.collection("formData").get();
  const applicants = snapshot.docs.map((doc) => ({
    id: doc.id,
    _id: doc.id,
    ...serializeFirestoreData(doc.data()),
  }));

  return (
    <main className="min-h-screen bg-[var(--color-bg-admin)]">
      <AdminContent applicants={applicants} />
    </main>
  );
}
