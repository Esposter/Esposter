import type { ParticlesConfiguration } from "#src/models/configuration/ParticlesConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type ParticlesEventEmitsOptions = EmitsOptionsFor<ParticlesConfiguration> & GameObjectEventMapEmitsOptions;
