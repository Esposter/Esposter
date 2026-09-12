import type { StarConfiguration } from "#src/models/configuration/StarConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type StarEventEmitsOptions = EmitsOptionsFor<StarConfiguration> & GameObjectEventMapEmitsOptions;
