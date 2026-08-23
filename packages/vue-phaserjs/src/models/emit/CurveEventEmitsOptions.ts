import type { CurveConfiguration } from "#src/models/configuration/CurveConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type CurveEventEmitsOptions = EmitsOptionsFor<CurveConfiguration> & GameObjectEventMapEmitsOptions;
