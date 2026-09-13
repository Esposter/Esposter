import type { TriangleConfiguration } from "#src/models/configuration/TriangleConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type TriangleEventEmitsOptions = EmitsOptionsFor<TriangleConfiguration> & GameObjectEventMapEmitsOptions;
