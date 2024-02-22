import type { ExcludeFunctionProperties } from "@/util/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type TextureCropConfiguration = ExcludeFunctionProperties<
  GameObjects.Components.TextureCrop & { textureKey: string }
>;
