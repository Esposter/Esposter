import type { ContainerConfiguration } from "@/models/configuration/ContainerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type ContainerEventEmitsOptions = EmitsOptionsFor<ContainerConfiguration> & GameObjectEventMapEmitsOptions;
