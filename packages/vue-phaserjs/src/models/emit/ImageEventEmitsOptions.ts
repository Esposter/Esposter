import type { ImageConfiguration } from "#src/models/configuration/ImageConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type ImageEventEmitsOptions = EmitsOptionsFor<ImageConfiguration> & GameObjectEventMapEmitsOptions;
