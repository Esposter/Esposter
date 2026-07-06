import type { ArcConfiguration } from "@/models/configuration/ArcConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type ArcEventEmitsOptions = EmitsOptionsFor<ArcConfiguration> & GameObjectEventMapEmitsOptions;
