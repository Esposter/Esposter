import type { NinesliceConfiguration } from "@/models/configuration/NinesliceConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type NinesliceEventEmitsOptions = EmitsOptionsFor<NinesliceConfiguration> & GameObjectEventMapEmitsOptions;
