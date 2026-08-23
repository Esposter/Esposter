import type { ZoneConfiguration } from "#src/models/configuration/ZoneConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type ZoneEventEmitsOptions = EmitsOptionsFor<ZoneConfiguration> & GameObjectEventMapEmitsOptions;
