import type { GraphicsConfiguration } from "#src/models/configuration/GraphicsConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type GraphicsEventEmitsOptions = EmitsOptionsFor<GraphicsConfiguration> & GameObjectEventMapEmitsOptions;
