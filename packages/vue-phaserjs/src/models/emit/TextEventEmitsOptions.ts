import type { TextConfiguration } from "@/models/configuration/TextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "@/util/types/EmitsOptionsFor";

export type TextEventEmitsOptions = EmitsOptionsFor<TextConfiguration> & GameObjectEventMapEmitsOptions;
