"use client";

import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Platform } from "@/types/campanhas";

interface PlatformTabsProps {
  current: Platform;
  from: string;
  to: string;
}

export function PlatformTabs({ current, from, to }: PlatformTabsProps) {
  const router = useRouter();

  function handleChange(value: string) {
    if (value !== "meta" && value !== "google") return;
    router.replace(`/campanhas?platform=${value}&from=${from}&to=${to}`);
  }

  return (
    <Tabs value={current} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="meta">Meta Ads</TabsTrigger>
        <TabsTrigger value="google">Google Ads</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
