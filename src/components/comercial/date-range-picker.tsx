"use client";

import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import {
  endOfDay,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from: string;
  to: string;
  minDate: string;
}

interface Preset {
  label: string;
  getRange: () => { from: Date; to: Date };
}

export function ComercialDatePicker({
  from,
  to,
  minDate,
}: DateRangePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const currentFrom = parseISO(from);
  const currentTo = parseISO(to);
  const min = parseISO(minDate);
  const today = new Date();

  const [range, setRange] = useState<DateRange | undefined>({
    from: currentFrom,
    to: currentTo,
  });

  const presets: Preset[] = [
    {
      label: "Hoje",
      getRange: () => ({
        from: startOfDay(today),
        to: endOfDay(today),
      }),
    },
    {
      label: "Ontem",
      getRange: () => {
        const yesterday = subDays(today, 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        };
      },
    },
    {
      label: "Esta semana",
      getRange: () => ({
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfDay(today),
      }),
    },
    {
      label: "Este mês",
      getRange: () => ({
        from: startOfMonth(today),
        to: endOfDay(today),
      }),
    },
    {
      label: "Últimos 7 dias",
      getRange: () => ({
        from: startOfDay(subDays(today, 6)),
        to: endOfDay(today),
      }),
    },
    {
      label: "Últimos 30 dias",
      getRange: () => ({
        from: startOfDay(subDays(today, 29)),
        to: endOfDay(today),
      }),
    },
    {
      label: "Últimos 3 meses",
      getRange: () => ({
        from: startOfDay(subMonths(today, 3)),
        to: endOfDay(today),
      }),
    },
    {
      label: "Período máximo",
      getRange: () => ({
        from: startOfDay(min),
        to: endOfDay(today),
      }),
    },
  ];

  function navigate(fromDate: Date, toDate: Date) {
    const fromStr = format(fromDate, "yyyy-MM-dd");
    const toStr = format(toDate, "yyyy-MM-dd");
    router.replace(`/comercial?from=${fromStr}&to=${toStr}`);
  }

  function handlePreset(preset: Preset) {
    const { from: f, to: t } = preset.getRange();
    setRange({ from: f, to: t });
    setOpen(false);
    navigate(f, t);
  }

  function handleRangeSelect(selected: DateRange | undefined) {
    setRange(selected);
    if (selected?.from && selected?.to) {
      setOpen(false);
      navigate(selected.from, selected.to);
    }
  }

  const displayFrom = format(currentFrom, "dd MMM yyyy", { locale: ptBR });
  const displayTo = format(currentTo, "dd MMM yyyy", { locale: ptBR });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !from && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>
            {displayFrom} — {displayTo}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto p-0" align="start">
        <div className="flex flex-col gap-1 border-r border-border p-3">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              size="sm"
              className="justify-start text-sm"
              onClick={() => handlePreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="p-3">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            defaultMonth={subMonths(currentTo, 1)}
            fromDate={min}
            toDate={today}
            locale={ptBR}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
