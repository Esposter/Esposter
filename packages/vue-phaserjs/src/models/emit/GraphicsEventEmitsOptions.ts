import type { GraphicsConfiguration } from "#src/models/configuration/GraphicsConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type GraphicsEventEmitsOptions = EmitsOptionsFor<GraphicsConfiguration> & GameObjectEventMapEmitsOptions;
