import type { IsoTriangleConfiguration } from "#src/models/configuration/IsoTriangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type IsoTriangleEventEmitsOptions = EmitsOptionsFor<IsoTriangleConfiguration> & GameObjectEventMapEmitsOptions;
