import type { SceneEventKeys } from "@/models/phaser/SceneEventKeys";

export type SceneEvents = Record<SceneEventKeys, () => void>;
