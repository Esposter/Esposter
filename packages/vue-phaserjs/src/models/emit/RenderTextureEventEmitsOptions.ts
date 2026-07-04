import type { RenderTextureConfiguration } from "@/models/configuration/RenderTextureConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type RenderTextureEventEmitsOptions = EmitsOptionsFor<RenderTextureConfiguration> &
  GameObjectEventMapEmitsOptions;
