import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1º Trimestre 2026 | Adapt Link",
  description: "Análise trimestral Q1 2026 — funil de vendas, canais e plano de ação",
};

export default function TrimestreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
