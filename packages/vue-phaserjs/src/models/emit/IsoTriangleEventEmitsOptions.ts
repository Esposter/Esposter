import type { IsoTriangleConfiguration } from "#src/models/configuration/IsoTriangleConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type IsoTriangleEventEmitsOptions = EmitsOptionsFor<IsoTriangleConfiguration> & GameObjectEventMapEmitsOptions;
