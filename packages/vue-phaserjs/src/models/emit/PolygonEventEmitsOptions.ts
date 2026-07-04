import type { PolygonConfiguration } from "@/models/configuration/PolygonConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type PolygonEventEmitsOptions = EmitsOptionsFor<PolygonConfiguration> & GameObjectEventMapEmitsOptions;
