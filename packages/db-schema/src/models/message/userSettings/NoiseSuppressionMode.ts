import { z } from "zod";

export const NoiseSuppressionMode = { Custom: "Custom", Studio: "Studio", VoiceIsolation: "VoiceIsolation" } as const;
export type NoiseSuppressionMode = (typeof NoiseSuppressionMode)[keyof typeof NoiseSuppressionMode];

export const noiseSuppressionModeSchema = z.enum(NoiseSuppressionMode) satisfies z.ZodType<NoiseSuppressionMode>;
