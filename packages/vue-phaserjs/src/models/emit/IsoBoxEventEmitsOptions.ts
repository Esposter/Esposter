import type { IsoBoxConfiguration } from "@/models/configuration/IsoBoxConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type IsoBoxEventEmitsOptions = EmitsOptionsFor<IsoBoxConfiguration> & GameObjectEventMapEmitsOptions;
