import type { RenderTextureConfiguration } from "#src/models/configuration/RenderTextureConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type RenderTextureEventEmitsOptions = EmitsOptionsFor<RenderTextureConfiguration> &
  GameObjectEventMapEmitsOptions;
