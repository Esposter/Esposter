import type { CurveConfiguration } from "#src/models/configuration/CurveConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type CurveEventEmitsOptions = EmitsOptionsFor<CurveConfiguration> & GameObjectEventMapEmitsOptions;
