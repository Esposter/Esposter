import type { TextConfiguration } from "#src/models/configuration/TextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type TextEventEmitsOptions = EmitsOptionsFor<TextConfiguration> & GameObjectEventMapEmitsOptions;
