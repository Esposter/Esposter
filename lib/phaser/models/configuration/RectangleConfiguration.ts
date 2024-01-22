import { type OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import { type ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import { type GameObjects } from "phaser";
import { type GlobalConfiguration } from "~/lib/phaser/models/configuration/global/GlobalConfiguration";

export type RectangleConfiguration = Partial<
  GameObjects.Rectangle & OriginConfiguration & ScrollFactorConfiguration & GlobalConfiguration
>;
