import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campanhas | Meta Ads",
  description: "Métricas de campanhas Meta Ads",
};

export default function CampanhasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
