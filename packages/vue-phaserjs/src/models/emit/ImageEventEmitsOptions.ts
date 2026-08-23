import type { ImageConfiguration } from "#src/models/configuration/ImageConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type ImageEventEmitsOptions = EmitsOptionsFor<ImageConfiguration> & GameObjectEventMapEmitsOptions;
