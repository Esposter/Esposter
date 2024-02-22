import type { ExcludeFunctionProperties } from "@/util/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type TextureConfiguration = ExcludeFunctionProperties<GameObjects.Components.Texture & { textureKey: string }>;
