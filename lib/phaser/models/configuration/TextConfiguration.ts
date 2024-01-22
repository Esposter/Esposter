import { type Types } from "phaser";
import { type GlobalConfiguration } from "~/lib/phaser/models/configuration/global/GlobalConfiguration";

export type TextConfiguration = Types.GameObjects.Text.TextConfig & GlobalConfiguration;
