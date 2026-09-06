import { z } from "zod";

export enum NoiseSuppressionMode {
  Custom = "Custom",
  Studio = "Studio",
  VoiceIsolation = "VoiceIsolation",
}

export const noiseSuppressionModeSchema = z.enum(NoiseSuppressionMode) satisfies z.ZodType<NoiseSuppressionMode>;
