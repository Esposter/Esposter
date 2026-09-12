import type { ContainerConfiguration } from "#src/models/configuration/ContainerConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type ContainerEventEmitsOptions = EmitsOptionsFor<ContainerConfiguration> & GameObjectEventMapEmitsOptions;
