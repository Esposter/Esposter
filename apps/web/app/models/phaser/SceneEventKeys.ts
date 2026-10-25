import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";

export type SceneEventKeys =
  | `${NpcId}${typeof EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`
  | `${SceneEventKey}${keyof typeof SceneKey}`;
