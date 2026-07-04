import type { EllipseConfiguration } from "@/models/configuration/EllipseConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type EllipseEventEmitsOptions = EmitsOptionsFor<EllipseConfiguration> & GameObjectEventMapEmitsOptions;
