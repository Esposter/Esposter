import type { TextConfiguration } from "#src/models/configuration/TextConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type TextEventEmitsOptions = EmitsOptionsFor<TextConfiguration> & GameObjectEventMapEmitsOptions;
