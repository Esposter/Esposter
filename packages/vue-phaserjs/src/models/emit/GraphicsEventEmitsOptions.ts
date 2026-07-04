import type { GraphicsConfiguration } from "@/models/configuration/GraphicsConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type GraphicsEventEmitsOptions = EmitsOptionsFor<GraphicsConfiguration> & GameObjectEventMapEmitsOptions;
