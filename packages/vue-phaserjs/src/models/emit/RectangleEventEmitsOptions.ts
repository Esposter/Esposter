import type { RectangleConfiguration } from "#src/models/configuration/RectangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type RectangleEventEmitsOptions = EmitsOptionsFor<RectangleConfiguration> & GameObjectEventMapEmitsOptions;
