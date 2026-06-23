import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { NoiseSuppressionMode } from "@esposter/db-schema";

export const NoiseSuppressionModeItems = [
  {
    subtitle: `Just your beautiful voice: let ${MESSAGE_DISPLAY_NAME} cut through the noise.`,
    title: "Voice Isolation",
    value: NoiseSuppressionMode.VoiceIsolation,
  },
  { subtitle: "Pure audio: open mic with no processing.", title: "Studio", value: NoiseSuppressionMode.Studio },
  {
    subtitle: "Advanced mode: give me all the buttons and dials!",
    title: "Custom",
    value: NoiseSuppressionMode.Custom,
  },
] as const satisfies { subtitle: string; title: string; value: NoiseSuppressionMode }[];
