"use client";

import React from "react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <NavBar />
      <div className="flex-1">
        <Hero />
      </div>
      <Footer />
    </main>
  );
}
