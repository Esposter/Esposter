import type { PolygonConfiguration } from "#src/models/configuration/PolygonConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type PolygonEventEmitsOptions = EmitsOptionsFor<PolygonConfiguration> & GameObjectEventMapEmitsOptions;
