import type { QualityTier } from "genshin-engine";
import type { GameLanguage } from "genshin-text";

// The settings a device keeps, as the game keeps its own per device: the quality tier the world renders at, the game
// Language the Settings screen's labels show, the three volume levels from 1 to 10, the camera's default distance, its
// Horizontal and vertical sensitivity, and whether its pitch follows the slope
export interface GenshinSettings {
  defaultDistance: number;
  horizontalSensitivity: number;
  language: GameLanguage;
  musicVolume: number;
  qualityTier: QualityTier;
  sfxVolume: number;
  slopePitch: boolean;
  verticalSensitivity: number;
  volume: number;
}
