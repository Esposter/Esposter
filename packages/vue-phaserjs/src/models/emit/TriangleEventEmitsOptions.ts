import type { TriangleConfiguration } from "#src/models/configuration/TriangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type TriangleEventEmitsOptions = EmitsOptionsFor<TriangleConfiguration> & GameObjectEventMapEmitsOptions;
