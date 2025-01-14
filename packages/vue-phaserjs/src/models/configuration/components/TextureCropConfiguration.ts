import type { BaseTextureConfiguration } from "@/models/configuration/components/BaseTextureConfiguration";
import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { Except } from "type-fest";

export type TextureCropConfiguration = ExcludeFunctionProperties<
  BaseTextureConfiguration & Except<GameObjects.Components.TextureCrop, keyof BaseTextureConfiguration>
>;
