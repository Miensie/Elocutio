# -*- coding: utf-8 -*-
"""Modules 7 à 10."""

# ---------------------------------------------------------------------------
# MODULE 7 — Penser rapidement et parler sans bloquer
# ---------------------------------------------------------------------------
EXOS_PENSEE_RAPIDE = [
    dict(nom="Exercice « 3 secondes »",
         consigne="On vous donne un sujet. Vous disposez de 3 secondes avant de devoir commencer à "
                   "parler, et vous devez tenir 45 secondes sans vous arrêter.",
         objectif="Réduire le temps de latence entre la pensée et la parole"),
    dict(nom="Exercice « Mot imposé »",
         consigne="On vous donne un mot au hasard. Vous devez parler immédiatement pendant 30 "
                   "secondes en partant de ce mot, sans préparation.",
         objectif="Démarrer la parole sans plan préétabli"),
    dict(nom="Exercice « Objet »",
         consigne="On vous montre ou on vous nomme un objet du quotidien. Vous devez expliquer son "
                   "utilité, ses usages possibles et une anecdote imaginée, pendant 1 minute.",
         objectif="Développer une idée simple en discours structuré"),
    dict(nom="Exercice « Pourquoi ? »",
         consigne="On vous donne une affirmation (vraie ou volontairement étrange). Vous devez "
                   "expliquer pourquoi, en improvisant une justification cohérente, pendant 1 minute.",
         objectif="Construire une argumentation à la volée"),
    dict(nom="Exercice « Défendre l'indéfendable »",
         consigne="On vous donne une opinion difficile à défendre (ex. « il vaut mieux arriver en "
                   "retard qu'en avance »). Trouvez des arguments pendant 1 à 2 minutes.",
         objectif="Développer la souplesse argumentative et la répartie"),
    dict(nom="Exercice « Association rapide »",
         consigne="On vous donne un mot. Enchaînez immédiatement : mot → idée → exemple → conséquence, "
                   "sans pause entre chaque étape.",
         objectif="Automatiser l'enchaînement logique des idées"),
    dict(nom="Exercice « Question surprise »",
         consigne="On vous pose une question inattendue. Vous devez répondre immédiatement, sans "
                   "temps de réflexion visible, même si la réponse est imparfaite.",
         objectif="Réduire le réflexe de silence face à l'imprévu"),
]

SUJETS_IMPRO_3S = [
    "Le café", "Un lundi matin", "Un objet oublié", "La patience", "Un voyage improvisé",
    "Le silence", "Une bonne surprise", "Le premier jour d'école", "Un imprévu", "La curiosité",
    "Un souvenir d'enfance", "Le changement", "Une erreur utile", "L'attente", "Un talent caché",
    "La routine", "Une rencontre", "Le courage", "Un projet abandonné", "La générosité",
    "Un lieu préféré", "La motivation", "Une habitude à changer", "Le temps qui passe", "Un conseil reçu",
    "La simplicité", "Un défi personnel", "La chance", "Une décision rapide", "L'improvisation elle-même",
    "Un métier étonnant", "La persévérance", "Un objet indispensable", "Le doute", "Une belle journée",
    "L'autonomie", "Un souvenir marquant", "La confiance en soi", "Un rêve récent", "La curiosité intellectuelle",
    "Une tradition familiale", "Le travail en équipe", "Un lieu qui inspire", "La spontanéité", "Un apprentissage récent",
    "La gratitude", "Un petit plaisir quotidien", "La créativité", "Un objectif pour demain", "Le fait de recommencer",
]

# ---------------------------------------------------------------------------
# MODULE 8 — Réduire les hésitations
# ---------------------------------------------------------------------------
POURQUOI_HESITATIONS = (
    "Les hésitations (« euh », « hum », répétitions) apparaissent presque toujours au même moment : "
    "lorsque la bouche a fini une idée mais que la tête n'a pas encore formulé la suivante. Le corps "
    "comble alors ce vide par un son réflexe, pour « garder la parole » sans avoir réellement quelque "
    "chose à dire. Le vrai problème n'est donc pas le son lui-même, mais l'absence de stratégie de "
    "remplacement : personne ne nous a appris à nous taire brièvement sans se sentir en échec."
)

REMPLACEMENTS_HESITATIONS = [
    ("« euh… »", "Une pause silencieuse de 1 seconde, bouche fermée, regard stable"),
    ("« hum… »", "Une respiration discrète et volontaire"),
    ("« donc… »", "Une reformulation brève de ce qui vient d'être dit"),
    ("« en fait… »", "Une transition maîtrisée : « ce qui compte, c'est que… »"),
]

EXOS_HESITATIONS = [
    dict(nom="La pause volontaire", consigne="Parlez 1 minute sur un sujet simple. À chaque envie de "
         "dire « euh », remplacez-la consciemment par un silence de une seconde, sans autre son."),
    dict(nom="La reformulation express", consigne="Dès que vous sentez un blanc arriver, dites à voix "
         "haute une phrase de transition neutre (« ce que je veux dire, c'est que… ») plutôt qu'un son "
         "réflexe."),
    dict(nom="Comptage des hésitations", consigne="Enregistrez-vous 2 minutes sur un sujet libre, puis "
         "réécoutez et comptez précisément le nombre de « euh », « hum » et répétitions."),
    dict(nom="Silence assumé", consigne="Parlez à un miroir pendant 1 minute en vous imposant au moins "
         "3 pauses silencieuses volontaires d'une seconde, en gardant un regard stable pendant la pause."),
]

# ---------------------------------------------------------------------------
# MODULE 9 — Vitesse et mesure du débit
# ---------------------------------------------------------------------------
VITESSE_NIVEAUX = [
    dict(niveau="Niveau 1", contenu="Phrase de 10 mots",
         exemple="Le café chaud fume encore sur la table basse."),
    dict(niveau="Niveau 2", contenu="Phrase de 20 mots",
         exemple="Chaque matin, avant même de sortir de son lit, elle prenait le temps de respirer "
                 "calmement pendant plusieurs minutes."),
    dict(niveau="Niveau 3", contenu="Phrase de 30 mots",
         exemple="Le projet, qui avait pourtant démarré dans des conditions difficiles, a fini par "
                 "aboutir grâce à la persévérance de toute l'équipe et à une organisation rigoureuse "
                 "du travail."),
    dict(niveau="Niveau 4", contenu="Paragraphe complet (utiliser un texte du Module 5)"),
    dict(niveau="Niveau 5", contenu="Texte complet chronométré (utiliser le texte du test initial)"),
]

FORMULE_MPM = (
    "Mots par minute (MPM) = (nombre de mots lus) ÷ (temps en secondes) × 60. "
    "Exemple : 150 mots lus en 75 secondes → (150 ÷ 75) × 60 = 120 MPM."
)
INTERPRETATION_MPM = [
    ("110 à 150 MPM", "Débit conversationnel courant, généralement bien compris"),
    ("150 à 170 MPM", "Débit soutenu, adapté à un exposé dynamique bien articulé"),
    ("170 à 190 MPM", "Débit rapide, nécessite une articulation très précise pour rester clair"),
    ("Au-delà de 190 MPM", "Débit à réserver aux exercices : au-delà, la clarté baisse pour la plupart des orateurs"),
]

# ---------------------------------------------------------------------------
# MODULE 10 — Double tâche
# ---------------------------------------------------------------------------
EXOS_DOUBLE_TACHE = [
    dict(nom="Compter en parlant", consigne="Comptez mentalement de 1 à 50 dans votre tête tout en "
         "racontant à voix haute votre journée. À la fin, donnez le dernier chiffre atteint."),
    dict(nom="Parler en classant", consigne="Décrivez votre pièce préférée tout en énonçant les objets "
         "que vous voyez par ordre alphabétique."),
    dict(nom="Structure imposée", consigne="Racontez un souvenir en respectant une structure imposée : "
         "problème → action → résultat → leçon, sans dévier de cet ordre."),
    dict(nom="Histoire à mots imposés", consigne="On vous donne 5 mots sans lien apparent. Racontez une "
         "histoire cohérente de 1 minute qui les utilise tous."),
    dict(nom="Contrainte double", consigne="Expliquez le fonctionnement d'un objet simple en évitant "
         "totalement d'utiliser le verbe « être »."),
    dict(nom="Changement de sujet immédiat", consigne="Parlez sur un sujet donné ; au signal (un mot "
         "frappé sur la table, une minuterie), changez immédiatement de sujet sans transition préparée."),
    dict(nom="Continuer après un mot aléatoire", consigne="Commencez une phrase librement ; au moment "
         "où l'on vous glisse un mot au hasard, intégrez-le immédiatement dans la suite de la phrase."),
]
