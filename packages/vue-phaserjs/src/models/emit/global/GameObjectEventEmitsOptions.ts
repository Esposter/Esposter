import type { GameObjectConfiguration } from "#src/models/configuration/global/GameObjectConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
// Phaser-specific game object events, which the setter map does not implement — a vue event here is
// Redirected to the equivalent phaser one instead.
export type GameObjectEventEmitsOptions = EmitsOptionsFor<GameObjectConfiguration> & GameObjectEventMapEmitsOptions;
