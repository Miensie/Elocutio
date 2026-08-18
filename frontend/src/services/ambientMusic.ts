/**
 * Musique d'ambiance générée en direct (synthèse), pas un fichier audio
 * chargé depuis le disque : évite tout problème de droits d'auteur et de
 * poids d'asset. C'est un pad doux, lent, en boucle sur une progression
 * d'accords simple — pensé pour rester en arrière-plan sans distraire.
 *
 * Les navigateurs bloquent l'audio tant qu'aucune interaction utilisateur
 * n'a eu lieu (politique d'autoplay) : Tone.start() doit donc être appelé
 * depuis un gestionnaire de clic, jamais au chargement de la page.
 *
 * Tone.js (~250 Ko) est chargé en dynamic import, pas en import statique :
 * la grande majorité des utilisateurs qui n'activent jamais la musique ne
 * paient jamais ce coût sur le bundle initial.
 */
type ToneModule = typeof import("tone");

let Tone: ToneModule | null = null;
let padSynth: InstanceType<ToneModule["PolySynth"]> | null = null;
let loopPart: InstanceType<ToneModule["Loop"]> | null = null;
let started = false;

// Progression douce et un peu introspective, adaptée à un fond d'entraînement
// (pas de tension harmonique forte) : Am9 -> Fmaj7 -> Cmaj7 -> Gsus2
const CHORDS: string[][] = [
  ["A3", "C4", "E4", "G4", "B4"],
  ["F3", "A3", "C4", "E4"],
  ["C3", "E3", "G3", "B3"],
  ["G3", "B3", "D4", "A4"]
];

async function ensureGraph() {
  if (!Tone) {
    Tone = await import("tone");
  }
  if (padSynth) return;

  const reverb = new Tone.Reverb({ decay: 8, wet: 0.55 }).toDestination();
  const filter = new Tone.Filter({ frequency: 1200, type: "lowpass" }).connect(reverb);

  padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 3, decay: 1, sustain: 0.6, release: 6 }
  }).connect(filter);

  padSynth.volume.value = -22; // très en retrait, ambiance et non premier plan

  let chordIndex = 0;
  loopPart = new Tone.Loop((time) => {
    padSynth?.triggerAttackRelease(CHORDS[chordIndex % CHORDS.length], "6n", time);
    chordIndex += 1;
  }, "4m"); // un accord toutes les 4 mesures : évolution lente
}

export async function startAmbientMusic() {
  await ensureGraph();
  if (!Tone) return;
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }
  Tone.getTransport().bpm.value = 54;
  loopPart?.start(0);
  Tone.getTransport().start();
  started = true;
}

export function stopAmbientMusic() {
  if (!started || !Tone) return;
  loopPart?.stop();
  Tone.getTransport().stop();
  started = false;
}

export function isAmbientMusicStarted() {
  return started;
}
