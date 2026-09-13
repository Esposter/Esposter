import type { BitmapTextConfiguration } from "#src/models/configuration/BitmapTextConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type BitmapTextEventEmitsOptions = EmitsOptionsFor<BitmapTextConfiguration> & GameObjectEventMapEmitsOptions;
