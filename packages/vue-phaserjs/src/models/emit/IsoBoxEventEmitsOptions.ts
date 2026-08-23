import type { IsoBoxConfiguration } from "#src/models/configuration/IsoBoxConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type IsoBoxEventEmitsOptions = EmitsOptionsFor<IsoBoxConfiguration> & GameObjectEventMapEmitsOptions;
