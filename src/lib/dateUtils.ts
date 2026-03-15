import { DateField } from "@/data/types";

export type DateStatus = "done" | "late" | "normal";

export function getDateStatus(field: DateField): DateStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(field.target);

  if (field.done) return "done";
  if (target < today) return "late";
  return "normal";
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function calculateWeeks(totalDays: number): number {
  return Math.round((totalDays / 7) * 10) / 10;
}

export function calculatePredictionWeeks(createdDate: string, recommendationDate: string): number {
  const created = new Date(createdDate);
  const recommendation = new Date(recommendationDate);
  const diffMs = recommendation.getTime() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.round((diffDays / 7) * 10) / 10;
}
