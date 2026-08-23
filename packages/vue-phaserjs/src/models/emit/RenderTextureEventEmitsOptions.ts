import type { RenderTextureConfiguration } from "#src/models/configuration/RenderTextureConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type RenderTextureEventEmitsOptions = EmitsOptionsFor<RenderTextureConfiguration> &
  GameObjectEventMapEmitsOptions;
