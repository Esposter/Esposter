import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type ArcEventEmitsOptions = EmitsOptionsFor<ArcConfiguration> & GameObjectEventMapEmitsOptions;
