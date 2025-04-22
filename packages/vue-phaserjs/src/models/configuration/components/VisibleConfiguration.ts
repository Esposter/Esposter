import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export interface VisibleConfiguration extends ExcludeFunctionProperties<GameObjects.Components.Visible> {}
