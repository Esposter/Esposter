import type { SpriteConfiguration } from "@/models/configuration/SpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type SpriteEventEmitsOptions = EmitsOptionsFor<SpriteConfiguration> & GameObjectEventMapEmitsOptions;
