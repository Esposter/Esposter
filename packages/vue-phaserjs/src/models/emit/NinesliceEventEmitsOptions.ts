import type { NinesliceConfiguration } from "#src/models/configuration/NinesliceConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type NinesliceEventEmitsOptions = EmitsOptionsFor<NinesliceConfiguration> & GameObjectEventMapEmitsOptions;
