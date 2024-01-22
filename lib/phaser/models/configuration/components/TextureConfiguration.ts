import { type GameObjects } from "phaser";

export type TextureConfiguration = GameObjects.Components.TextureCrop & { textureKey?: string };
