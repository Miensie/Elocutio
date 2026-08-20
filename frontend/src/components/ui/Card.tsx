import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  // Le fond par défaut (bg-white) ne s'applique que si `className` ne
  // spécifie pas déjà sa propre couleur de fond : sans cette garde, deux
  // classes "bg-*" en conflit produisent un résultat imprévisible (l'ordre
  // dans l'attribut class ne détermine PAS quelle classe gagne en CSS —
  // c'est l'ordre dans la feuille de style compilée qui compte). Ce projet
  // n'utilise pas tailwind-merge, donc cette garde simple évite la classe
  // de bug la plus fréquente : un Card avec fond personnalisé qui reste
  // blanc et rend son texte illisible.
  const hasCustomBackground = /\bbg-/.test(className);

  return (
    <div
      className={`${hasCustomBackground ? "" : "bg-white "}border border-brand-100 rounded-xl shadow-sm p-6 ${className}`}
      {...props}
    />
  );
}
