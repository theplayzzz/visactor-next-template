"use client";

import { useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import type { NPSProcessedData } from "@/types/nps";
import { cn } from "@/lib/utils";

interface NPSCommentsTableProps {
  comments: NPSProcessedData[];
}

export default function NPSCommentsTable({ comments }: NPSCommentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Filtros
  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || comment.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const styles = {
      promoter: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
      neutral: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
      detractor: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    };

    const labels = {
      promoter: "Promotor",
      neutral: "Neutro",
      detractor: "Detrator",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          styles[category as keyof typeof styles],
        )}
      >
        {labels[category as keyof typeof labels]}
      </span>
    );
  };

  return (
    <section className="rounded-lg border border-border p-6">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comentários dos Clientes</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {filteredComments.length} comentários
        </span>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4 phone:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou comentário..."
            className="w-full rounded-lg border border-border bg-background px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">Todas as categorias</option>
          <option value="promoter">Promotores</option>
          <option value="neutral">Neutros</option>
          <option value="detractor">Detratores</option>
        </select>
      </div>

      {/* Tabela com Scroll */}
      <div className="max-h-[600px] overflow-y-auto overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-border text-left text-sm text-muted-foreground">
              <th className="pb-3 pt-3 px-4 font-medium">Cliente</th>
              <th className="pb-3 pt-3 px-4 font-medium">Score</th>
              <th className="pb-3 pt-3 px-4 font-medium">Categoria</th>
              <th className="pb-3 pt-3 px-4 font-medium">Comentário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredComments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhum comentário encontrado
                </td>
              </tr>
            ) : (
              filteredComments.map((comment) => (
                <tr key={comment.leadId} className="group hover:bg-muted/50">
                  <td className="py-4 px-4">
                    <div className="font-medium">{comment.leadName}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {comment.leadId}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-semibold">
                        {comment.totalScore}
                      </span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      R1: {comment.r1Score} | R2: {comment.r2Score}
                    </div>
                  </td>
                  <td className="py-4 px-4">{getCategoryBadge(comment.category)}</td>
                  <td className="py-4 px-4">
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                      {comment.comment}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
