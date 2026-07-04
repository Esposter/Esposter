import type { ImageConfiguration } from "@/models/configuration/ImageConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type ImageEventEmitsOptions = EmitsOptionsFor<ImageConfiguration> & GameObjectEventMapEmitsOptions;
