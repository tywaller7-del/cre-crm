"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LenderForm } from "@/components/lenders/lender-form";
import { ArrowLeft } from "lucide-react";
import type { Lender } from "@/types/database";

export default function EditLenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lender, setLender] = useState<Lender | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("lenders")
        .select("*")
        .eq("id", id)
        .single();
      setLender(data as Lender);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!lender) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Lender not found.
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Edit {lender.name}</h1>
      <LenderForm lender={lender} />
    </div>
  );
}
