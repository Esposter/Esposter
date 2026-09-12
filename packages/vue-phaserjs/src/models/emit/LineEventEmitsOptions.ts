import type { LineConfiguration } from "#src/models/configuration/LineConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type LineEventEmitsOptions = EmitsOptionsFor<LineConfiguration> & GameObjectEventMapEmitsOptions;
