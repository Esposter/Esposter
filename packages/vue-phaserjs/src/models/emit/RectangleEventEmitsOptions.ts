import type { RectangleConfiguration } from "#src/models/configuration/RectangleConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type RectangleEventEmitsOptions = EmitsOptionsFor<RectangleConfiguration> & GameObjectEventMapEmitsOptions;
