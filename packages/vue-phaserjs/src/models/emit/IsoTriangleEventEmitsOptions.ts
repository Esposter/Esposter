import type { IsoTriangleConfiguration } from "@/models/configuration/IsoTriangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type IsoTriangleEventEmitsOptions = EmitsOptionsFor<IsoTriangleConfiguration> & GameObjectEventMapEmitsOptions;
