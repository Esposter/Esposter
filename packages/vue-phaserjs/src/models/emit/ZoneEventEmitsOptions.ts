import type { ZoneConfiguration } from "@/models/configuration/ZoneConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type ZoneEventEmitsOptions = EmitsOptionsFor<ZoneConfiguration> & GameObjectEventMapEmitsOptions;
