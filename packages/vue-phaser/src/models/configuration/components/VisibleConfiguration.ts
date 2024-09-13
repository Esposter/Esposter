import type { ExcludeFunctionProperties } from "@/utils/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type VisibleConfiguration = ExcludeFunctionProperties<GameObjects.Components.Visible>;
