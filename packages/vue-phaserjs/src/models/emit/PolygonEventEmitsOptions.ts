import type { PolygonConfiguration } from "#src/models/configuration/PolygonConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type PolygonEventEmitsOptions = EmitsOptionsFor<PolygonConfiguration> & GameObjectEventMapEmitsOptions;
