import type { BaseTextureConfiguration } from "@/lib/phaser/models/configuration/components/BaseTextureConfiguration";
import type { Except } from "@/util/types/Except";
import type { ExcludeFunctionProperties } from "@/util/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type TextureConfiguration = ExcludeFunctionProperties<
  Except<GameObjects.Components.Texture, "frame"> & BaseTextureConfiguration
>;
