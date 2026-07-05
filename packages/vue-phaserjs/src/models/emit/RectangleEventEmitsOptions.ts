import type { RectangleConfiguration } from "@/models/configuration/RectangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type RectangleEventEmitsOptions = EmitsOptionsFor<RectangleConfiguration> & GameObjectEventMapEmitsOptions;
