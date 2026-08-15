import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { useExerciseCategories, useExercises } from "@/hooks/useExercises";

const DIFFICULTIES = [
  { value: "", label: "Tous niveaux" },
  { value: "facile", label: "Facile" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "difficile", label: "Difficile" },
  { value: "expert", label: "Expert" }
];

export default function ExerciseLibraryPage() {
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");

  const { data: categories } = useExerciseCategories();
  const { data: exercises, isLoading } = useExercises({ category, difficulty });

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-brand-700">Bibliothèque d'exercices</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              category === "" ? "bg-brand-700 text-white border-brand-700" : "bg-white border-brand-100"
            }`}
          >
            Toutes catégories
          </button>
          {categories?.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.code)}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                category === c.code ? "bg-brand-700 text-white border-brand-700" : "bg-white border-brand-100"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border border-brand-100 rounded-lg px-3 py-2 text-sm"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {isLoading ? (
          <p className="text-sm text-brand-900/50">Chargement…</p>
        ) : exercises?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {exercises.map((ex) => (
              <Card key={ex.id} className="p-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-semibold text-brand-700 text-sm">{ex.title}</h3>
                  <span className="text-[10px] uppercase tracking-wide bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-xs text-brand-900/50">
                  {ex.exercise_categories?.name} · {Math.round(ex.duration_sec / 60) || 1} min
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-900/50">Aucun exercice ne correspond à ces filtres.</p>
        )}
      </div>
    </AppShell>
  );
}
