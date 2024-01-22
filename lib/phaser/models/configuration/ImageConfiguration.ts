import { type GlobalConfiguration } from "@/lib/phaser/models/configuration/global/GlobalConfiguration";
import { type Types } from "phaser";

export type ImageConfiguration = Types.GameObjects.Sprite.SpriteConfig & GlobalConfiguration;
