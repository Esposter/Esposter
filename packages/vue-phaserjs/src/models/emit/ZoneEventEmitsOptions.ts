import type { ZoneConfiguration } from "#src/models/configuration/ZoneConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type ZoneEventEmitsOptions = EmitsOptionsFor<ZoneConfiguration> & GameObjectEventMapEmitsOptions;
