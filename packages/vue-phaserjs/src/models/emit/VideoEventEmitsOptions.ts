import type { VideoConfiguration } from "#src/models/configuration/VideoConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type VideoEventEmitsOptions = EmitsOptionsFor<VideoConfiguration> & GameObjectEventMapEmitsOptions;
