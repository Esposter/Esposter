import type { LineConfiguration } from "@/models/configuration/LineConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type LineEventEmitsOptions = EmitsOptionsFor<LineConfiguration> & GameObjectEventMapEmitsOptions;
