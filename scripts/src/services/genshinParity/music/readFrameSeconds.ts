import { CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH } from "#src/services/genshinParity/shared/constants";

// The centre in seconds of a frame of the pitch classes' and the bands' own frames
export const readFrameSeconds = (frame: number, sampleRate: number): number =>
  (frame * CHROMA_HOP_LENGTH + CHROMA_FRAME_LENGTH / 2) / sampleRate;
