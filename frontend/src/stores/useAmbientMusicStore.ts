import { create } from "zustand";
import { startAmbientMusic, stopAmbientMusic } from "@/services/ambientMusic";

const STORAGE_KEY = "elocutio:ambient-music-enabled";

interface AmbientMusicState {
  /** Préférence de l'utilisateur (persistée) : veut-il de la musique en général. */
  enabled: boolean;
  /** État réel de lecture, qui peut différer de `enabled` pendant un
   *  enregistrement (coupée temporairement sans changer la préférence). */
  playing: boolean;
  /** Vrai si la musique était en train de jouer juste avant une coupure
   *  temporaire (pour la reprendre automatiquement après). */
  wasPlayingBeforeMute: boolean;
  toggle: () => Promise<void>;
  muteForRecording: () => void;
  unmuteAfterRecording: () => Promise<void>;
}

export const useAmbientMusicStore = create<AmbientMusicState>((set, get) => ({
  enabled: typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true",
  playing: false,
  wasPlayingBeforeMute: false,

  toggle: async () => {
    const next = !get().enabled;
    localStorage.setItem(STORAGE_KEY, String(next));
    if (next) {
      await startAmbientMusic();
      set({ enabled: true, playing: true });
    } else {
      stopAmbientMusic();
      set({ enabled: false, playing: false });
    }
  },

  // Appelé quand un enregistrement démarre : coupe la musique pour qu'elle
  // ne se retrouve pas mélangée à la voix captée par le micro, sans changer
  // la préférence "enabled" de l'utilisateur.
  muteForRecording: () => {
    const { playing } = get();
    if (playing) {
      stopAmbientMusic();
      set({ playing: false, wasPlayingBeforeMute: true });
    } else {
      set({ wasPlayingBeforeMute: false });
    }
  },

  unmuteAfterRecording: async () => {
    if (get().wasPlayingBeforeMute && get().enabled) {
      await startAmbientMusic();
      set({ playing: true, wasPlayingBeforeMute: false });
    }
  }
}));
