import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export type VisibleConfiguration = ExcludeFunctionProperties<GameObjects.Components.Visible>;
