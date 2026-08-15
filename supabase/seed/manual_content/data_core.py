# -*- coding: utf-8 -*-
"""Contenu du manuel — modules 0 à 3 (intro, test initial, respiration, échauffement, articulation)."""

TITRE = "MAÎTRISER SA PAROLE"
SOUS_TITRE = "Programme progressif pour améliorer l'élocution, la diction, l'articulation, la fluidité et la spontanéité orale"
BANDEAU = "Programme d'entraînement pratique — 8 semaines"

# ---------------------------------------------------------------------------
# SOMMAIRE
# ---------------------------------------------------------------------------
SOMMAIRE = [
    ("Introduction", "Comprendre l'élocution, la diction et le débit"),
    ("Test de niveau initial", "Mesurer votre point de départ"),
    ("Module 1", "Respiration et contrôle de la voix"),
    ("Module 2", "Échauffement de la bouche"),
    ("Module 3", "Articulation des sons"),
    ("Module 4", "Virelangues (103 exercices)"),
    ("Module 5", "Lecture à voix haute (20 textes)"),
    ("Module 6", "Parler lentement puis rapidement"),
    ("Module 7", "Penser rapidement et parler sans bloquer"),
    ("Module 8", "Réduire les « euh », « hum » et hésitations"),
    ("Module 9", "Exercices de vitesse et mesure du débit"),
    ("Module 10", "Double tâche : penser et parler en même temps"),
    ("Module 11", "Improvisation orale (100 sujets)"),
    ("Module 12", "Simulations réelles (30 mises en situation)"),
    ("Module 13", "Programme complet sur 8 semaines"),
    ("Fiches de suivi", "Tableaux de progression et bilans hebdomadaires"),
    ("Test final", "Comparer votre progression avant / après"),
    ("Routines express", "5 min, 15 min, 30 min et routine avant de parler"),
]

# ---------------------------------------------------------------------------
# INTRODUCTION
# ---------------------------------------------------------------------------
INTRO_PARAS = [
    ("Qu'est-ce que l'élocution ?",
     "L'élocution est la manière dont vous formez et enchaînez vos mots à voix haute : la clarté, "
     "le rythme et l'aisance avec lesquels votre pensée devient parole audible. Une bonne élocution "
     "ne signifie pas parler « joliment », mais parler de façon à être compris sans effort par celui qui écoute."),
    ("Qu'est-ce que la diction ?",
     "La diction concerne la précision avec laquelle chaque son est prononcé : la netteté des voyelles, "
     "la fermeté des consonnes, l'absence de sons « avalés ». Une diction travaillée rend chaque mot "
     "reconnaissable, même à distance ou dans le bruit."),
    ("Qu'est-ce que l'articulation ?",
     "L'articulation est le travail mécanique des lèvres, de la langue, de la mâchoire et du voile du "
     "palais qui façonne les sons. C'est une compétence motrice : elle s'améliore par la répétition, "
     "exactement comme un geste sportif."),
    ("Qu'est-ce que le débit ?",
     "Le débit est la vitesse à laquelle vous parlez, généralement mesurée en mots par minute (MPM). "
     "Un bon débit n'est pas fixe : il varie selon le contexte, ralentit sur les idées importantes et "
     "accélère sur les informations secondaires."),
    ("Qu'est-ce que la fluidité ?",
     "La fluidité est la continuité de la parole : la capacité à enchaîner les phrases sans blocage, "
     "sans hésitation excessive, sans recommencer sans cesse. Elle dépend autant de la préparation "
     "mentale que de la maîtrise physique de la voix."),
    ("Pourquoi bloque-t-on en parlant vite ?",
     "Un blocage survient presque toujours pour l'une de ces trois raisons : le souffle manque avant "
     "la fin de la phrase, les muscles de l'articulation n'ont pas eu le temps de s'échauffer, ou la "
     "pensée n'a pas anticipé la phrase suivante. Parler vite sans bloquer suppose donc de travailler "
     "ces trois dimensions séparément avant de les combiner."),
    ("Le rôle de la respiration",
     "La voix est portée par l'air expiré. Une respiration courte, haute et irrégulière limite "
     "mécaniquement la longueur des phrases et provoque des essoufflements en fin de propos. "
     "Apprendre à respirer par le diaphragme et à doser son expiration est la base de tout travail vocal."),
    ("Le rôle des muscles de la bouche et de la langue",
     "Comme tout muscle, les muscles articulatoires se fatiguent, se raidissent au réveil et gagnent "
     "en précision avec l'entraînement. Un échauffement de quelques minutes avant un exercice exigeant "
     "améliore immédiatement la netteté de la parole."),
    ("Le rôle de la préparation mentale",
     "Beaucoup d'hésitations ne viennent pas de la bouche mais de la tête : on cherche une idée avant "
     "de l'avoir formulée. Travailler la rapidité de structuration de la pensée — savoir démarrer une "
     "phrase avant d'en connaître la fin — est aussi important que le travail vocal."),
    ("Parler vite n'est pas parler efficacement",
     "Un débit rapide mais confus est contre-productif : il fatigue l'auditeur et brouille le message. "
     "La règle fondamentale de ce programme est donc la suivante : la vitesse doit toujours être "
     "construite à partir de la précision, jamais à ses dépens. Chaque exercice de vitesse de ce manuel "
     "part d'une exécution lente et parfaite avant d'accélérer progressivement."),
]

# ---------------------------------------------------------------------------
# TEST INITIAL / FINAL (structure commune)
# ---------------------------------------------------------------------------
TEST_TEXTE_LECTURE = (
    "La parole est un instrument que l'on façonne avec patience. Chaque jour, ceux qui prennent le "
    "temps de travailler leur respiration, d'échauffer leur bouche et de répéter leurs phrases "
    "gagnent en clarté ce que d'autres perdent en précipitation. Parler vite n'a jamais suffi à "
    "convaincre : c'est la netteté du propos, la solidité du souffle et la justesse du rythme qui "
    "retiennent l'attention d'un auditoire. Un bon orateur ne cherche pas à impressionner par la "
    "vitesse, mais à être compris sans effort, même par quelqu'un qui l'écoute pour la première fois. "
    "C'est cette exigence, simple en apparence mais redoutable dans les faits, qui distingue une "
    "parole maîtrisée d'une parole seulement rapide."
)

TEST_PHRASES_ARTICULATION = [
    "Six cent six chasseurs sachant chasser six cent six chevreuils.",
    "Le juge jugea juste jusqu'à ce que justice soit rendue.",
    "Trois gros rats gris rongent trois gros croûtons ronds.",
    "Ces cerises sont si sûres qu'on ne sait pas si c'en sont.",
    "Combien coûtent ces quinze caisses de kiwis craquants ?",
    "Fruits frais, fruits frits, fruits cuits, fruits crus, fruits secs.",
    "Le steward alluma une allumette et éteignit six bougies.",
    "Pauvre petit pêcheur, prends patience pour pêcher plusieurs poissons.",
]

TEST_SUJETS_SPONTANES = [
    "Décrivez votre trajet pour venir jusqu'ici, en 2 minutes.",
    "Racontez la dernière fois où vous avez dû improviser.",
    "Expliquez pourquoi vous suivez ce programme.",
]

TEST_QUESTIONS_IMPRO = [
    "Quel est, selon vous, l'objet le plus utile de votre sac ou de votre poche ?",
    "Si vous deviez enseigner une compétence en 5 minutes, laquelle choisiriez-vous ?",
    "Quelle est la dernière décision rapide que vous avez prise ?",
    "Quel conseil donneriez-vous à quelqu'un qui commence votre métier ou vos études ?",
    "Décrivez votre semaine idéale.",
]

TEST_VIRELANGUES_CHRONO = [
    "Un chasseur sachant chasser sait chasser sans son chien.",
    "Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ?",
    "Si six scies scient six cyprès, six cent six scies scient six cent six cyprès.",
    "Didon dîna, dit-on, du dos d'un dodu dindon.",
]

FICHE_EVALUATION_COLONNES = [
    "Critère", "Résultat brut", "Note /10", "Observation"
]
FICHE_EVALUATION_LIGNES = [
    "Diction (lecture 1 min)",
    "Articulation (phrases difficiles)",
    "Débit (mots/minute estimé)",
    "Fluidité (2 min sans préparation)",
    "Improvisation (réponses immédiates)",
    "Virelangues (temps + erreurs)",
    "Hésitations (nombre total)",
]

# ---------------------------------------------------------------------------
# MODULE 1 — RESPIRATION
# ---------------------------------------------------------------------------
RESPIRATION_EXOS = [
    dict(nom="Respiration abdominale allongée", objectif="Ressentir le mouvement du diaphragme",
         position="Allongé sur le dos, une main sur le ventre, une sur la poitrine",
         instructions="Inspirez lentement par le nez en gonflant le ventre (la main sur la poitrine "
                       "ne bouge presque pas). Expirez lentement par la bouche en rentrant le ventre.",
         duree="3 minutes", repetitions="1 série continue",
         erreur="Soulever les épaules ou la poitrine au lieu du ventre",
         progression="Passer de la position allongée à assise, puis debout, en gardant la même sensation"),
    dict(nom="Respiration 4-4-4", objectif="Réguler et calmer la respiration avant de parler",
         position="Assis, dos droit",
         instructions="Inspirez sur 4 temps, retenez l'air 4 temps, expirez sur 4 temps.",
         duree="2 minutes", repetitions="8 à 10 cycles",
         erreur="Bloquer les épaules pendant la rétention",
         progression="Allonger progressivement à 4-4-6 puis 4-4-8"),
    dict(nom="Expiration sur consonne continue (S)", objectif="Contrôler la régularité de l'expiration",
         position="Debout, dos droit",
         instructions="Inspirez profondément, puis expirez en émettant un « ssss » continu, le plus "
                       "régulier et le plus long possible, sans à-coups.",
         duree="1 minute", repetitions="5 séries",
         erreur="Laisser le son faiblir puis remonter en volume (souffle irrégulier)",
         progression="Chronométrer la durée du son et essayer de l'allonger chaque semaine"),
    dict(nom="Expiration sur consonne continue (F)", objectif="Renforcer le contrôle du flux d'air",
         position="Debout, dos droit",
         instructions="Même principe que l'exercice précédent avec un « ffff » continu et stable.",
         duree="1 minute", repetitions="5 séries",
         erreur="Serrer la mâchoire pendant l'exercice",
         progression="Alterner S et F sans reprendre son souffle entre les deux"),
    dict(nom="Compter sur une seule expiration", objectif="Apprendre à doser l'air sur la durée d'une phrase",
         position="Debout ou assis",
         instructions="Inspirez, puis comptez à voix haute le plus loin possible sur une seule "
                       "expiration, sans forcer la voix ni accélérer artificiellement.",
         duree="2 minutes", repetitions="5 essais",
         erreur="Accélérer le débit pour « aller plus loin » : cela fausse l'exercice",
         progression="Noter le chiffre atteint chaque semaine et viser une progression régulière"),
    dict(nom="Phrase longue sur une expiration", objectif="Relier respiration et longueur de phrase réelle",
         position="Debout",
         instructions="Choisissez une phrase de 15 à 20 mots. Dites-la entièrement sur une seule "
                       "expiration, à un rythme naturel, sans épuiser complètement l'air.",
         duree="3 minutes", repetitions="6 phrases différentes",
         erreur="Vider complètement les poumons (cela crispe la fin de phrase)",
         progression="Augmenter progressivement la longueur des phrases travaillées"),
    dict(nom="Respiration en marchant", objectif="Dissocier respiration automatique et respiration contrôlée",
         position="En marchant à allure normale",
         instructions="Inspirez sur 4 pas, expirez sur 4 pas, en gardant une respiration basse et calme.",
         duree="5 minutes", repetitions="1 séance",
         erreur="Respirer haut et court à cause du rythme de marche",
         progression="Essayer de parler à voix haute tout en maintenant ce rythme respiratoire"),
    dict(nom="Reprise d'air discrète en lecture", objectif="Apprendre à reprendre son souffle sans casser le rythme",
         position="Debout, texte en main",
         instructions="Lisez un paragraphe en plaçant volontairement de courtes reprises d'air aux "
                       "virgules, sans marquer de pause audible ni de bruit d'inspiration.",
         duree="3 minutes", repetitions="2 paragraphes",
         erreur="Inspirer bruyamment ou marquer un arrêt trop long",
         progression="Réduire progressivement le nombre de reprises nécessaires par phrase"),
    dict(nom="Voix projetée sans forcer", objectif="Contrôler le volume grâce au souffle, pas à la gorge",
         position="Debout, face à un mur à 3-4 mètres",
         instructions="Prononcez une phrase courte en visant le mur, en poussant l'air depuis le "
                       "ventre plutôt qu'en serrant la gorge.",
         duree="3 minutes", repetitions="10 phrases",
         erreur="Forcer sur les cordes vocales (sensation de tension dans la gorge)",
         progression="Reculer progressivement la distance de la cible"),
    dict(nom="Stabilité vocale sur voyelle tenue", objectif="Stabiliser la hauteur et le volume de la voix",
         position="Assis ou debout",
         instructions="Tenez un « aaaa » à hauteur et volume constants aussi longtemps que possible, "
                       "sans trembler ni varier.",
         duree="2 minutes", repetitions="5 essais",
         erreur="Laisser la voix descendre en hauteur en fin de son",
         progression="Chronométrer et comparer la durée d'une semaine à l'autre"),
]

# ---------------------------------------------------------------------------
# MODULE 2 — ÉCHAUFFEMENT DE LA BOUCHE
# ---------------------------------------------------------------------------
ECHAUFFEMENT_EXOS = [
    dict(zone="Lèvres", nom="Vibrations de lèvres (bruit de moteur)",
         instructions="Laissez vos lèvres vibrer librement en soufflant, comme un moteur qui tourne, "
                       "sur des sons graves puis aigus.", duree="1 minute"),
    dict(zone="Lèvres", nom="Étirement O / I",
         instructions="Alternez rapidement une bouche très arrondie (« O ») et une bouche très étirée "
                       "(« I »), en exagérant le mouvement.", duree="1 minute"),
    dict(zone="Langue", nom="Pointe de langue contre les dents",
         instructions="Passez la pointe de la langue derrière les dents du haut, puis du bas, puis "
                       "faites le tour complet des dents dans les deux sens.", duree="1 minute"),
    dict(zone="Langue", nom="Langue en pointe / langue plate",
         instructions="Tirez la langue en pointe fine, puis aplatissez-la largement, en alternant "
                       "rapidement.", duree="1 minute"),
    dict(zone="Mâchoire", nom="Ouverture/fermeture contrôlée",
         instructions="Ouvrez lentement la mâchoire au maximum sans douleur, maintenez 2 secondes, "
                       "puis refermez lentement.", duree="1 minute"),
    dict(zone="Mâchoire", nom="Mouvements latéraux",
         instructions="Déplacez doucement la mâchoire inférieure de gauche à droite, comme une "
                       "mastication lente.", duree="30 secondes"),
    dict(zone="Joues", nom="Gonflage et dégonflage",
         instructions="Gonflez les deux joues d'air, faites-le passer d'une joue à l'autre, puis "
                       "relâchez d'un coup.", duree="1 minute"),
    dict(zone="Muscles faciaux", nom="Grimaces exagérées",
         instructions="Enchaînez des expressions faciales exagérées (sourire large, bouche en cœur, "
                       "sourcils levés) pour réveiller l'ensemble du visage.", duree="1 minute"),
    dict(zone="Alternance de sons", nom="BA-BA / PA-PA / TA-TA / KA-KA",
         instructions="Répétez chaque syllabe rapidement 10 fois, en articulant nettement, puis "
                       "enchaînez les quatre séries sans pause.", duree="2 minutes"),
    dict(zone="Ouverture de bouche", nom="Bâillement contrôlé",
         instructions="Simulez un grand bâillement pour détendre l'arrière de la gorge et le voile "
                       "du palais, 3 à 4 répétitions.", duree="1 minute"),
]
