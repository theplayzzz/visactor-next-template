import { TrimestreDashboard } from "@/components/trimestre/trimestre-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TrimestrePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 tablet:px-8">
      <TrimestreDashboard />
    </div>
  );
}
