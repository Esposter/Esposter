import type { LineConfiguration } from "#src/models/configuration/LineConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type LineEventEmitsOptions = EmitsOptionsFor<LineConfiguration> & GameObjectEventMapEmitsOptions;
