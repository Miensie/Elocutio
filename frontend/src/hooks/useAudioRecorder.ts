import { useCallback, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording" | "paused" | "stopped" | "error";

interface UseAudioRecorderOptions {
  /** Appelé au moment exact où l'enregistrement démarre (pour couper la
   *  musique d'ambiance avant qu'elle ne se retrouve captée par le micro). */
  onStart?: () => void;
  /** Appelé quand l'enregistrement s'arrête définitivement (stop, pas pause). */
  onStop?: () => void;
}

/**
 * Encapsule l'API MediaRecorder du navigateur derrière une machine à états
 * simple : idle -> requesting -> recording <-> paused -> stopped.
 * Le format dépend du navigateur (webm/opus sur Chrome/Firefox/Android,
 * mp4/aac sur Safari) : on laisse le navigateur choisir via son type MIME
 * préféré plutôt que d'en forcer un qu'il ne supporterait pas forcément.
 */
export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationSec(0);
    chunksRef.current = [];
    setStatus("requesting");

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("error");
      setError("L'enregistrement audio n'est pas supporté par ce navigateur.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : ""; // laisse le navigateur choisir son défaut (ex: Safari)

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        cleanupStream();
        options.onStop?.();
      };

      recorder.onerror = () => {
        setStatus("error");
        setError("Une erreur est survenue pendant l'enregistrement.");
        cleanupStream();
      };

      options.onStart?.();
      recorder.start();
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      setStatus("recording");

      timerRef.current = setInterval(() => {
        setDurationSec((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000);
      }, 200);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Accès au microphone refusé. Autorisez le micro dans les réglages du navigateur."
          : "Impossible d'accéder au microphone."
      );
      cleanupStream();
    }
  }, [cleanupStream, options]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      const pauseStarted = Date.now();
      mediaRecorderRef.current.resume();
      setStatus("recording");
      timerRef.current = setInterval(() => {
        setDurationSec((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000);
      }, 200);
      pausedDurationRef.current += Date.now() - pauseStarted;
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setStatus("stopped");
    }
  }, []);

  const reset = useCallback(() => {
    cleanupStream();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setStatus("idle");
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationSec(0);
    setError(null);
  }, [audioUrl, cleanupStream]);

  return { status, error, audioBlob, audioUrl, durationSec, start, pause, resume, stop, reset };
}
