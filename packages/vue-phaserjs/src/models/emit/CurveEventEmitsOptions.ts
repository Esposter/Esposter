import type { CurveConfiguration } from "@/models/configuration/CurveConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type CurveEventEmitsOptions = EmitsOptionsFor<CurveConfiguration> & GameObjectEventMapEmitsOptions;
