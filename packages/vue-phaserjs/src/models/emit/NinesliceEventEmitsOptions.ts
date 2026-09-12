import type { NinesliceConfiguration } from "#src/models/configuration/NinesliceConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type NinesliceEventEmitsOptions = EmitsOptionsFor<NinesliceConfiguration> & GameObjectEventMapEmitsOptions;
