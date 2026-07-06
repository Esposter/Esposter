import type { TriangleConfiguration } from "@/models/configuration/TriangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type TriangleEventEmitsOptions = EmitsOptionsFor<TriangleConfiguration> & GameObjectEventMapEmitsOptions;
