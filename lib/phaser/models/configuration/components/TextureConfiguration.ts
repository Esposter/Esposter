import { type GameObjects } from "phaser";

export type TextureConfiguration = GameObjects.Components.Texture & { textureKey: string };
