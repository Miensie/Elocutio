import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white border border-brand-100 rounded-xl shadow-sm p-6 ${className}`}
      {...props}
    />
  );
}
