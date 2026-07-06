import type { StarConfiguration } from "@/models/configuration/StarConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type StarEventEmitsOptions = EmitsOptionsFor<StarConfiguration> & GameObjectEventMapEmitsOptions;
