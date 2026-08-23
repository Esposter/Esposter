import type { PathFollowerConfiguration } from "#src/models/configuration/PathFollowerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type PathFollowerEventEmitsOptions = EmitsOptionsFor<PathFollowerConfiguration> & GameObjectEventMapEmitsOptions;
