import type { GameObjectConfiguration } from "#src/models/configuration/global/GameObjectConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";
// Phaser-specific game object events, so the setter map doesn't implement them; we just redirect
// Our vue events to the equivalent phaser event.
export type GameObjectEventEmitsOptions = EmitsOptionsFor<GameObjectConfiguration> & GameObjectEventMapEmitsOptions;
