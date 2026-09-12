import type { VideoConfiguration } from "#src/models/configuration/VideoConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type VideoEventEmitsOptions = EmitsOptionsFor<VideoConfiguration> & GameObjectEventMapEmitsOptions;
