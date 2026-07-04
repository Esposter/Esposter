import type { PathFollowerConfiguration } from "@/models/configuration/PathFollowerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type PathFollowerEventEmitsOptions = EmitsOptionsFor<PathFollowerConfiguration> & GameObjectEventMapEmitsOptions;
