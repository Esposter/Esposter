import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";

const { qualityTiers, sampleCount, targetFps } = GlobeConfiguration;

// Quality only ever steps down: a run that holds the frame rate keeps its tier, and so does the lowest one
export const getNextQualityTier = (frameDurations: readonly number[], tier: number) => {
  if (frameDurations.length < sampleCount || tier >= qualityTiers.length - 1) return tier;
  const meanFrameDuration = frameDurations.reduce((sum, duration) => sum + duration, 0) / frameDurations.length;
  return 1000 / meanFrameDuration < targetFps ? tier + 1 : tier;
};
