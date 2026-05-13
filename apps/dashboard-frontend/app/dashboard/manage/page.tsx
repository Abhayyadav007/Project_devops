"use client";

import { Suspense } from "react";
import EntityTable from "@/components/dashboard/entity-table";

export default function ManagePage() {
  return (
    <Suspense>
      <EntityTable />
    </Suspense>
  );
}
