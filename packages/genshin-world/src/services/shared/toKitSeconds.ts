import { KIT_FRAMES_PER_SECOND } from "#src/services/shared/constants";

// A count of a kit's frames as seconds: each its record holds as its kit is built, and each a kit counts as it plays
export const toKitSeconds = (frames: number): number => frames / KIT_FRAMES_PER_SECOND;
