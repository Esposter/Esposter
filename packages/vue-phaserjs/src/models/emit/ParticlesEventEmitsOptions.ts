import type { ParticlesConfiguration } from "@/models/configuration/ParticlesConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type ParticlesEventEmitsOptions = EmitsOptionsFor<ParticlesConfiguration> & GameObjectEventMapEmitsOptions;
