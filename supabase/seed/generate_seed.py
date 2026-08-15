# -*- coding: utf-8 -*-
"""Génère supabase/seed/0002_seed_exercises.sql à partir du contenu du manuel."""
import sys, json, re
sys.path.insert(0, "./manual_content")  # exécuter ce script depuis supabase/seed/

from data_core import RESPIRATION_EXOS, ECHAUFFEMENT_EXOS
from data_articulation import VIRELANGUES, SONS_GROUPES
from data_textes import TEXTES_LECTURE
from data_spontane import SUJETS_IMPRO_3S
from data_impro import SUJETS_IMPRO_FACILE, SUJETS_IMPRO_INTERMEDIAIRE, SUJETS_IMPRO_AVANCE, SUJETS_IMPRO_EXPERT, SIMULATIONS

def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"

def sql_json(obj):
    return "'" + json.dumps(obj, ensure_ascii=False).replace("'", "''") + "'::jsonb"

def parse_minutes_to_sec(txt):
    """'3 minutes' -> 180 ; '90 secondes' -> 90 ; fallback 120"""
    m = re.search(r"(\d+)\s*minute", txt)
    if m:
        return int(m.group(1)) * 60
    m = re.search(r"(\d+)\s*seconde", txt)
    if m:
        return int(m.group(1))
    return 120

lines = []
lines.append("-- ============================================================================")
lines.append("-- ELOCUTIO — Seed des exercices, généré depuis le contenu du manuel PDF")
lines.append("-- ============================================================================")
lines.append("")

# ----------------------------------------------------------------------------
# Catégories
# ----------------------------------------------------------------------------
categories = [
    ("respiration", "Respiration", "Exercices de respiration et de contrôle du souffle", 1),
    ("echauffement", "Échauffement", "Routine d'échauffement de la bouche et du visage", 2),
    ("articulation", "Articulation", "Travail des sons difficiles, progression complète", 3),
    ("virelangues", "Virelangues", "Virelangues classés par niveau et par son", 4),
    ("lecture", "Lecture à voix haute", "Textes d'entraînement variés et annotés", 5),
    ("improvisation", "Improvisation", "Sujets de prise de parole spontanée", 6),
    ("simulation", "Simulations réelles", "Mises en situation professionnelles", 7),
]
lines.append("insert into public.exercise_categories (code, name, description, display_order) values")
lines.append(",\n".join(
    f"  ({sql_str(c)}, {sql_str(n)}, {sql_str(d)}, {o})" for c, n, d, o in categories
) + "\non conflict (code) do nothing;")
lines.append("")

def insert_block(rows):
    lines.append("insert into public.exercises (category_id, title, difficulty, duration_sec, instructions, content, target_skill) values")
    lines.append(",\n".join(rows) + ";")
    lines.append("")

def cat_subquery(code):
    return f"(select id from public.exercise_categories where code = {sql_str(code)})"

# ----------------------------------------------------------------------------
# Respiration (Module 1)
# ----------------------------------------------------------------------------
rows = []
for x in RESPIRATION_EXOS:
    content = {
        "objectif": x["objectif"], "position": x["position"],
        "erreur_a_eviter": x["erreur"], "progression": x["progression"],
        "repetitions": x["repetitions"],
    }
    rows.append(
        f"  ({cat_subquery('respiration')}, {sql_str(x['nom'])}, 'facile', "
        f"{parse_minutes_to_sec(x['duree'])}, {sql_str(x['instructions'])}, {sql_json(content)}, 'respiration')"
    )
insert_block(rows)

# ----------------------------------------------------------------------------
# Échauffement (Module 2)
# ----------------------------------------------------------------------------
rows = []
for x in ECHAUFFEMENT_EXOS:
    content = {"zone": x["zone"]}
    rows.append(
        f"  ({cat_subquery('echauffement')}, {sql_str(x['nom'])}, 'facile', "
        f"{parse_minutes_to_sec(x['duree'])}, {sql_str(x['instructions'])}, {sql_json(content)}, 'echauffement')"
    )
insert_block(rows)

# ----------------------------------------------------------------------------
# Articulation par groupe de sons (Module 3) — un exercice = la progression complète
# ----------------------------------------------------------------------------
rows = []
for g in SONS_GROUPES:
    content = {
        "sons": g["sons"], "isoles": g["isoles"], "syllabes": g["syllabes"],
        "mots": g["mots"], "groupes": g["groupes"], "phrase": g["phrase"], "phrase_rapide": g["rapide"],
    }
    instructions = (
        "Progressez dans l'ordre : sons isolés, syllabes, mots, groupes de mots, "
        "phrase, puis phrase rapide. Ne passez à l'étape suivante que si la précédente est fluide."
    )
    target = "articulation_" + g["sons"].replace(" / ", "_").replace("/", "_")
    rows.append(
        f"  ({cat_subquery('articulation')}, {sql_str('Articulation ' + g['sons'])}, 'intermediaire', "
        f"300, {sql_str(instructions)}, {sql_json(content)}, {sql_str(target)})"
    )
insert_block(rows)

# ----------------------------------------------------------------------------
# Virelangues (Module 4) — 100 exercices
# ----------------------------------------------------------------------------
niveau_to_diff = {1: "facile", 2: "intermediaire", 3: "difficile", 4: "expert"}
rows = []
for texte, son, niveau in VIRELANGUES:
    content = {"texte": texte, "son": son, "niveau": niveau, "methode_etapes": 6}
    target = "articulation_" + re.sub(r"[^A-Za-z]+", "_", son)
    instructions = (
        "Méthode en 6 étapes : très lentement, lentement sans erreur, vitesse normale, "
        "légèrement plus rapide, vitesse maximale précise, puis 3 répétitions sans erreur."
    )
    rows.append(
        f"  ({cat_subquery('virelangues')}, {sql_str(texte[:60])}, {sql_str(niveau_to_diff[niveau])}, "
        f"90, {sql_str(instructions)}, {sql_json(content)}, {sql_str(target)})"
    )
# on insère par lots de 25 pour rester lisible
for i in range(0, len(rows), 25):
    insert_block(rows[i:i+25])

# ----------------------------------------------------------------------------
# Lecture à voix haute (Module 5) — 20 textes
# ----------------------------------------------------------------------------
rows = []
for t in TEXTES_LECTURE:
    content = {"texte": t["texte"], "type": t["type_"], "objectif": t["objectif"]}
    rows.append(
        f"  ({cat_subquery('lecture')}, {sql_str(t['titre'])}, 'intermediaire', "
        f"150, {sql_str('Lisez à voix haute en respectant les indications de pause et d’intonation.')}, "
        f"{sql_json(content)}, 'fluidite')"
    )
insert_block(rows)

# ----------------------------------------------------------------------------
# Improvisation (Module 7 + Module 11) — 150 sujets
# ----------------------------------------------------------------------------
rows = []
for s in SUJETS_IMPRO_3S:
    content = {"sujet": s, "prep_sec": 3, "duree_sec": 45, "mode": "3_secondes"}
    rows.append(
        f"  ({cat_subquery('improvisation')}, {sql_str('Impro 3s : ' + s)}, 'facile', "
        f"48, {sql_str('3 secondes de préparation puis parlez 45 secondes sans vous arrêter.')}, "
        f"{sql_json(content)}, 'improvisation')"
    )
for niveau_label, diff, duree, liste in [
    ("Facile", "facile", 90, SUJETS_IMPRO_FACILE),
    ("Intermédiaire", "intermediaire", 90, SUJETS_IMPRO_INTERMEDIAIRE),
    ("Avancé", "difficile", 120, SUJETS_IMPRO_AVANCE),
    ("Expert", "expert", 120, SUJETS_IMPRO_EXPERT),
]:
    for s in liste:
        content = {"sujet": s, "prep_sec": 3, "duree_sec": duree, "niveau": niveau_label}
        rows.append(
            f"  ({cat_subquery('improvisation')}, {sql_str('[' + niveau_label + '] ' + s[:50])}, {sql_str(diff)}, "
            f"{duree}, {sql_str('3 secondes de préparation maximum, puis parlez en continu.')}, "
            f"{sql_json(content)}, 'improvisation')"
        )
for i in range(0, len(rows), 25):
    insert_block(rows[i:i+25])

# ----------------------------------------------------------------------------
# Simulations (Module 12) — 30 situations
# ----------------------------------------------------------------------------
rows = []
for s in SIMULATIONS:
    content = {"situation": s}
    rows.append(
        f"  ({cat_subquery('simulation')}, {sql_str(s[:60])}, 'difficile', "
        f"180, {sql_str('Jouez la situation comme si elle était réelle : posture, voix projetée, regard stable.')}, "
        f"{sql_json(content)}, 'prise_de_parole')"
    )
insert_block(rows)

# ----------------------------------------------------------------------------
# Achievements (gamification — squelette de base)
# ----------------------------------------------------------------------------
achievements = [
    ("first_session", "Première séance", "Complétez votre première séance d'entraînement", "🏆"),
    ("streak_7", "7 jours consécutifs", "Entraînez-vous 7 jours de suite", "🔥"),
    ("speak_100min", "100 minutes de parole", "Cumulez 100 minutes d'entraînement vocal", "🎙"),
    ("virelangues_100", "100 virelangues", "Complétez 100 virelangues", "⚡"),
    ("impro_50", "50 improvisations", "Complétez 50 exercices d'improvisation", "🧠"),
    ("level_expert", "Niveau Expert", "Atteignez le niveau Expert dans une compétence", "🏅"),
]
lines.append("insert into public.achievements (code, label, description, icon) values")
lines.append(",\n".join(
    f"  ({sql_str(c)}, {sql_str(l)}, {sql_str(d)}, {sql_str(i)})" for c, l, d, i in achievements
) + "\non conflict (code) do nothing;")
lines.append("")

out_path = "./0002_seed_exercises.sql"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("Seed écrit :", out_path)
print("Taille :", len("\n".join(lines)), "caractères")
