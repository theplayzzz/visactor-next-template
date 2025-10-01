import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard NPS | VisActor Next Template",
  description: "Análise completa de pesquisa de satisfação Net Promoter Score",
};

export default function NPSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
