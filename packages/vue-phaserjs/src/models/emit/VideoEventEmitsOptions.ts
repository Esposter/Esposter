import type { VideoConfiguration } from "@/models/configuration/VideoConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type VideoEventEmitsOptions = EmitsOptionsFor<VideoConfiguration> & GameObjectEventMapEmitsOptions;
