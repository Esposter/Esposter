import type { BitmapTextConfiguration } from "#src/models/configuration/BitmapTextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type BitmapTextEventEmitsOptions = EmitsOptionsFor<BitmapTextConfiguration> & GameObjectEventMapEmitsOptions;
