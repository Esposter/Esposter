import type { GameObjectConfiguration } from "#src/models/configuration/global/GameObjectConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";
// Phaser-specific game object events, which the setter map does not implement — a vue event here is
// Redirected to the equivalent phaser one instead.
export type GameObjectEventEmitsOptions = EmitsOptionsFor<GameObjectConfiguration> & GameObjectEventMapEmitsOptions;
