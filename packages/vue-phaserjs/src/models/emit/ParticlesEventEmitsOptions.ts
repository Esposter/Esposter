import type { ParticlesConfiguration } from "#src/models/configuration/ParticlesConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type ParticlesEventEmitsOptions = EmitsOptionsFor<ParticlesConfiguration> & GameObjectEventMapEmitsOptions;
