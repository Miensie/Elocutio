# -*- coding: utf-8 -*-
"""Module 5 — 20 textes de lecture à voix haute, et Module 6 — 30 phrases lent/rapide."""

# Légende : / = pause courte, // = pause longue, ↑ = monter l'intonation, ↓ = descendre l'intonation
TEXTES_LECTURE = [
    dict(titre="1. La ville au réveil", objectif="Articulation et rythme régulier", type_="Narration",
         texte="La ville s'éveille lentement. / Les premiers volets s'ouvrent, / un à un, / sur des "
               "rues encore silencieuses. // Le boulanger allume sa devanture, / le facteur charge son "
               "vélo, / et déjà quelques passants pressés traversent la place. // Rien ne semble annoncer "
               "l'agitation qui, dans une heure, ↑ envahira chaque avenue. //"),
    dict(titre="2. Le vieux pont", objectif="Pauses et respiration", type_="Description",
         texte="Le vieux pont de pierre enjambe la rivière depuis trois siècles. / Ses arches usées "
               "portent encore les traces des crues anciennes, / et la mousse verte s'accroche aux "
               "joints fatigués. // On raconte / que les pêcheurs du village s'y retrouvaient chaque "
               "matin, / avant que le pont de fer ne le remplace, ↓ plus bas, dans la vallée. //"),
    dict(titre="3. Prise de parole en réunion", objectif="Débit maîtrisé, articulation professionnelle", type_="Discours",
         texte="Mesdames, Messieurs, / je vous remercie de votre présence ce matin. // Nous allons "
               "aborder trois points essentiels : / le calendrier du projet, / les ressources "
               "disponibles, / et les risques identifiés. // Je vous propose de commencer ↑ par un état "
               "des lieux rapide de la situation actuelle. //"),
    dict(titre="4. Rapport professionnel", objectif="Précision et clarté", type_="Texte professionnel",
         texte="Le chiffre d'affaires du dernier trimestre s'établit à deux millions trois cent mille "
               "euros, / soit une progression de sept pour cent par rapport à la période précédente. // "
               "Cette croissance s'explique principalement / par l'ouverture de deux nouveaux marchés / "
               "et par une réduction des coûts de production. //"),
    dict(titre="5. Se présenter en entretien", objectif="Fluidité et confiance", type_="Présentation personnelle",
         texte="Bonjour, / je m'appelle [votre prénom]. // Je viens de terminer une formation en "
               "[domaine], / au cours de laquelle j'ai particulièrement développé mes compétences en "
               "[compétence]. // Ce qui m'intéresse aujourd'hui, / c'est de mettre ces compétences au "
               "service d'un projet concret ↑ comme celui que vous proposez. //"),
    dict(titre="6. Le cycle de l'eau", objectif="Vocabulaire technique, articulation", type_="Texte scientifique",
         texte="L'eau des océans s'évapore sous l'effet de la chaleur solaire. // Cette vapeur s'élève, "
               "/ se refroidit en altitude / et se condense en fines gouttelettes qui forment les "
               "nuages. // Lorsque ces gouttelettes deviennent trop lourdes, / elles retombent sous "
               "forme de pluie ↓ et rejoignent, tôt ou tard, la mer. //"),
    dict(titre="7. Édition spéciale", objectif="Débit rapide contrôlé, intonation journalistique", type_="Texte journalistique",
         texte="Bonsoir à tous. / Ce soir, / trois informations à retenir. // D'abord, / la situation "
               "économique reste stable / malgré les incertitudes internationales. // Ensuite, / une "
               "nouvelle ligne de transport ouvrira dès la semaine prochaine. // Enfin, / la météo "
               "annonce un temps clément ↑ pour tout le week-end. //"),
    dict(titre="8. Le premier jour", objectif="Expressivité, variations de rythme", type_="Texte motivant",
         texte="Le premier jour est toujours le plus incertain. // On doute, / on hésite, / on se "
               "demande si l'on est à la hauteur. // Et pourtant, / c'est précisément ce premier pas / "
               "qui rend tout le reste possible. // Ne cherchez pas la perfection dès le départ : ↑ "
               "cherchez seulement à commencer. //"),
    dict(titre="9. Deux collègues", objectif="Alternance de voix, rythme naturel", type_="Dialogue",
         texte="— Tu as vu l'heure ? / La réunion commence dans dix minutes. // — Je sais, / je sais, / "
               "j'arrive tout de suite. // — Tu as les documents ? // — Oui, / ils sont là, / dans le "
               "dossier bleu. // — Parfait, ↑ alors on y va. //"),
    dict(titre="10. Le vocabulaire de la précision", objectif="Mots difficiles, articulation fine", type_="Vocabulaire difficile",
         texte="L'anesthésiste, / après avoir consulté l'électrocardiogramme, / a recommandé une "
               "surveillance postopératoire rigoureuse. // Le protocole thérapeutique prévoit une "
               "réévaluation systématique / toutes les quarante-huit heures, ↓ afin d'anticiper toute "
               "complication éventuelle. //"),
    dict(titre="11. La montagne au petit matin", objectif="Souffle long, phrases amples", type_="Description",
         texte="À cette altitude, / l'air se fait plus rare et plus vif. // Le sommet, / encore "
               "enveloppé de brume, / se dévoile lentement à mesure que le soleil se lève, / dessinant "
               "des ombres longues sur la neige fraîche, / tandis que le silence, ↑ presque total, / "
               "n'est troublé que par le crissement des pas. //"),
    dict(titre="12. Le premier client", objectif="Débit conversationnel", type_="Dialogue",
         texte="— Bonjour, / je cherche quelque chose de simple et efficace. // — Bien sûr, / laissez-"
               "moi vous montrer nos modèles les plus demandés. // — Celui-ci me plaît beaucoup. // — "
               "Excellent choix, ↑ il est disponible en trois couleurs. //"),
    dict(titre="13. Une décision difficile", objectif="Intonation, gravité maîtrisée", type_="Narration",
         texte="Il resta longtemps silencieux, / pesant chaque mot avant de parler. // Ce n'était pas "
               "une décision qu'on prenait à la légère, / et il le savait. // Finalement, ↓ après un "
               "dernier regard vers la fenêtre, / il se leva / et annonça sa décision d'une voix calme "
               "et posée. //"),
    dict(titre="14. Présentation de projet en 2 minutes", objectif="Débit soutenu et structuré", type_="Discours",
         texte="Notre projet répond à un besoin simple : / gagner du temps dans les tâches répétitives. "
               "// Concrètement, / notre solution automatise trois étapes clés / que nos utilisateurs "
               "effectuaient auparavant manuellement. // Les premiers retours sont très positifs, ↑ avec "
               "un gain de temps mesuré de trente pour cent. //"),
    dict(titre="15. Le marché du samedi", objectif="Rythme vivant, vocabulaire concret", type_="Description",
         texte="Sur la place, / les étals se dressent dès l'aube. // Les couleurs des fruits se "
               "mêlent à celles des légumes, / les cageots s'empilent, / et les vendeurs interpellent "
               "les passants d'une voix forte et chaleureuse. // L'odeur du pain chaud ↑ se mêle à "
               "celle du café fraîchement moulu. //"),
    dict(titre="16. Argumenter une opinion", objectif="Fermeté, articulation soutenue", type_="Discours",
         texte="Je pense sincèrement / que cette approche mérite d'être reconsidérée. // D'abord, / "
               "parce qu'elle repose sur des données anciennes. // Ensuite, / parce que le contexte a "
               "profondément changé. // Et enfin, ↑ parce qu'une alternative plus efficace existe déjà. //"),
    dict(titre="17. Une invention méconnue", objectif="Rythme narratif, précision des faits", type_="Texte scientifique",
         texte="On attribue souvent cette invention à un seul ingénieur, / alors qu'elle résulte en "
               "réalité du travail conjoint de plusieurs équipes. // Les premiers essais, / menés dans "
               "les années soixante, / se soldèrent par des échecs répétés, ↓ avant qu'une avancée "
               "décisive ne permette enfin la mise au point du prototype final. //"),
    dict(titre="18. Le dernier train", objectif="Tension narrative, variations de vitesse", type_="Narration",
         texte="Il courait / sans regarder derrière lui. // Les quais défilaient, / de plus en plus "
               "vite, / et le sifflet du train résonnait déjà. // Encore quelques mètres, / encore "
               "quelques secondes, ↑ et les portes se refermèrent / juste au moment où il sautait à "
               "bord. //"),
    dict(titre="19. Bilan de fin d'année", objectif="Débit posé et structuré", type_="Texte professionnel",
         texte="Cette année aura été marquée par plusieurs avancées majeures. // Nous avons renforcé "
               "notre équipe, / lancé deux nouveaux produits / et amélioré significativement notre "
               "satisfaction client. // Pour l'année prochaine, ↑ nous concentrerons nos efforts sur "
               "trois priorités claires. //"),
    dict(titre="20. Un dernier conseil", objectif="Expressivité, conclusion marquante", type_="Texte motivant",
         texte="Ce que vous venez de lire n'est qu'un point de départ. // La vraie progression se "
               "joue dans la répétition, / jour après jour, / bien plus que dans la théorie. // Alors "
               "ne cherchez pas la performance immédiate : ↑ cherchez la régularité, / et la clarté "
               "suivra naturellement. //"),
]

# ---------------------------------------------------------------------------
# MODULE 6 — 30 phrases pour contrôle du débit (lent → rapide → normal)
# ---------------------------------------------------------------------------
PHRASES_DEBIT = [
    "Le soleil se lève doucement sur la ville encore endormie.",
    "Chaque matin, je prends le temps de respirer avant de parler.",
    "La réunion commence à neuf heures précises dans la grande salle.",
    "Il faut structurer ses idées avant de prendre la parole.",
    "Le café chaud fume encore sur la table de la cuisine.",
    "Nous devons finaliser ce dossier avant la fin de la semaine.",
    "La clarté d'un discours vaut mieux que sa longueur excessive.",
    "Le train arrive en gare avec dix minutes de retard aujourd'hui.",
    "Un bon orateur sait aussi bien se taire que parler.",
    "Le projet avance bien malgré quelques difficultés techniques persistantes.",
    "La confiance se construit par la répétition et la préparation.",
    "Chaque exercice répété apporte un progrès, même minime.",
    "La respiration est la base de toute prise de parole efficace.",
    "Le silence, bien placé, renforce souvent un discours.",
    "Il est important de varier son rythme selon le message.",
    "La pratique quotidienne transforme un effort en habitude naturelle.",
    "Un mot bien choisi vaut mieux que dix mots approximatifs.",
    "La voix reflète autant l'état d'esprit que le contenu du discours.",
    "Prendre la parole devant un public s'apprend, comme tout le reste.",
    "La régularité de l'entraînement compte plus que son intensité ponctuelle.",
    "Un débit trop rapide fatigue l'auditeur plus qu'il ne le convainc.",
    "L'articulation précise permet d'être compris même dans le bruit.",
    "Chaque semaine apporte de nouveaux défis à ce programme d'entraînement.",
    "La spontanéité s'entraîne autant que la mémoire ou la logique.",
    "Savoir improviser, c'est avant tout savoir structurer vite ses idées.",
    "Un discours réussi commence toujours par une respiration maîtrisée.",
    "La progression demande de la patience autant que de la discipline.",
    "Parler clairement est une compétence, pas un talent inné.",
    "L'entraînement de la voix ressemble à l'entraînement d'un muscle.",
    "Aujourd'hui encore, je choisis de m'entraîner pour progresser demain.",
]
