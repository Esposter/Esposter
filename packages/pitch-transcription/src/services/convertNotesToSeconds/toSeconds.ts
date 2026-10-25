import { ANNOTATIONS_FRAMES_PER_WINDOW, AUDIO_SAMPLE_RATE, FFT_HOP, WINDOW_OFFSET_SECONDS } from "#src/constants";

// A frame's time in the recording: its hop's, pulled back once for every window before it
export const toSeconds = (frame: number): number =>
  (frame * FFT_HOP) / AUDIO_SAMPLE_RATE - WINDOW_OFFSET_SECONDS * Math.floor(frame / ANNOTATIONS_FRAMES_PER_WINDOW);
