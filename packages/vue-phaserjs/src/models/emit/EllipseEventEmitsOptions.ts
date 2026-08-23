import type { EllipseConfiguration } from "#src/models/configuration/EllipseConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type EllipseEventEmitsOptions = EmitsOptionsFor<EllipseConfiguration> & GameObjectEventMapEmitsOptions;
