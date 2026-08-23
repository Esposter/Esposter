import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type ArcEventEmitsOptions = EmitsOptionsFor<ArcConfiguration> & GameObjectEventMapEmitsOptions;
