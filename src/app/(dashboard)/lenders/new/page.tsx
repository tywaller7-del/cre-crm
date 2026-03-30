"use client";

import { LenderForm } from "@/components/lenders/lender-form";

export default function NewLenderPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Lender</h1>
      <LenderForm />
    </div>
  );
}
