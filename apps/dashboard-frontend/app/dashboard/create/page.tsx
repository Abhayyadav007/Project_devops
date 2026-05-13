"use client";

import { Suspense } from "react";
import CreateForm from "@/components/dashboard/create-form";

export default function CreatePage() {
  return (
    <Suspense>
      <CreateForm />
    </Suspense>
  );
}
