import type { IsoBoxConfiguration } from "#src/models/configuration/IsoBoxConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type IsoBoxEventEmitsOptions = EmitsOptionsFor<IsoBoxConfiguration> & GameObjectEventMapEmitsOptions;
