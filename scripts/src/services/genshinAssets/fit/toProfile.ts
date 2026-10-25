import type { SpectralNoiseProfile } from "genshin-engine";

export const toProfile = (
  { height, width }: { height: number; width: number },
  channels: SpectralNoiseProfile["channels"],
): SpectralNoiseProfile => ({ channels, height, width });
