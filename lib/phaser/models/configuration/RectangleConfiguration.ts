import { type OriginConfiguration } from "@/lib/phaser/models/configuration/OriginConfiguration";
import { type ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/ScrollFactorConfiguration";
import { type RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";
import { type GameObjects } from "phaser";

export type RectangleConfiguration = Partial<
  Pick<GameObjects.Rectangle & OriginConfiguration & ScrollFactorConfiguration, keyof typeof RectangleSetterMap>
>;
