import type { StarConfiguration } from "#src/models/configuration/StarConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type StarEventEmitsOptions = EmitsOptionsFor<StarConfiguration> & GameObjectEventMapEmitsOptions;
