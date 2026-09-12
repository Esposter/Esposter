import type { EllipseConfiguration } from "#src/models/configuration/EllipseConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type EllipseEventEmitsOptions = EmitsOptionsFor<EllipseConfiguration> & GameObjectEventMapEmitsOptions;
