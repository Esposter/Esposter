import type { TileSpriteConfiguration } from "@/models/configuration/TileSpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type TileSpriteEventEmitsOptions = EmitsOptionsFor<TileSpriteConfiguration> &
  GameObjectEventMapEmitsOptions &
  Record<string, unknown[]>;
