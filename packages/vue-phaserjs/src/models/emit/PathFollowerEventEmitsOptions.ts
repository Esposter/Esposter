import type { PathFollowerConfiguration } from "#src/models/configuration/PathFollowerConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type PathFollowerEventEmitsOptions = EmitsOptionsFor<PathFollowerConfiguration> & GameObjectEventMapEmitsOptions;
