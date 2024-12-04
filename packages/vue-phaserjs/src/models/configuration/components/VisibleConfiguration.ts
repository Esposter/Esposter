import type { ExcludeFunctionProperties } from "@/util/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type VisibleConfiguration = ExcludeFunctionProperties<GameObjects.Components.Visible>;
