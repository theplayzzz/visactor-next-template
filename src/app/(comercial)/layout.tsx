import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Comercial | Kommo CRM",
  description: "Métricas de vendas e pipeline comercial",
};

export default function ComercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
