import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import type { ID_SEPARATOR } from "@esposter/shared";

export type SceneEventKeys =
  | `${NpcId}${typeof EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`
  | `${SceneEventKey}${typeof ID_SEPARATOR}${keyof typeof SceneKey}`;
