import {
  type LucideIcon,
  CalendarRange,
  HandCoins,
  Megaphone,
  MessagesSquare,
  Star,
} from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
};

export const siteConfig = {
  title: "VisActor Next Template",
  description: "Template for VisActor and Next.js",
};

export const navigations: Navigation[] = [
  {
    icon: Star,
    name: "NPS",
    href: "/nps",
  },
  {
    icon: MessagesSquare,
    name: "Ticket",
    href: "/ticket",
  },
  {
    icon: HandCoins,
    name: "Comercial",
    href: "/comercial",
  },
  {
    icon: Megaphone,
    name: "Campanhas",
    href: "/campanhas",
  },
  {
    icon: CalendarRange,
    name: "1º Tri 2026",
    href: "/trimestre",
  },
];
