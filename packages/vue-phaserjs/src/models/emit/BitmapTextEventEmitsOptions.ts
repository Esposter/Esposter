import type { BitmapTextConfiguration } from "@/models/configuration/BitmapTextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type BitmapTextEventEmitsOptions = EmitsOptionsFor<BitmapTextConfiguration> & GameObjectEventMapEmitsOptions;
