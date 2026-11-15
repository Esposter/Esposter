import type { SceneEventKeys } from "#src/models/phaser/SceneEventKeys";

export type SceneEvents = Record<SceneEventKeys, () => void>;
