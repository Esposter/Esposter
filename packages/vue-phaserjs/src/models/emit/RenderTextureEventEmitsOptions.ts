import type { RenderTextureConfiguration } from "@/models/configuration/RenderTextureConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type RenderTextureEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof RenderTextureConfiguration>]: [RenderTextureConfiguration[ExtractUpdateEvent<P>]?];
};
