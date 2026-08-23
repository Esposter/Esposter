import type { ContainerConfiguration } from "#src/models/configuration/ContainerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type ContainerEventEmitsOptions = EmitsOptionsFor<ContainerConfiguration> & GameObjectEventMapEmitsOptions;
