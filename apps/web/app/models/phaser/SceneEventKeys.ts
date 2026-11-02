import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import type { ID_SEPARATOR } from "@esposter/shared";

// A scene's half of the key is the scene's Phaser key, which is a string at the type level, so it is any string
export type SceneEventKeys =
  | `${NpcId}${typeof ID_SEPARATOR}${typeof EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`
  | `${SceneEventKey}${typeof ID_SEPARATOR}${string}`;
