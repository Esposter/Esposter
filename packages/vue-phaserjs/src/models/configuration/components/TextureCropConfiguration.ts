import type { BaseTextureConfiguration } from "#src/models/configuration/components/BaseTextureConfiguration";
import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept, Except } from "type-fest";

export interface TextureCropConfiguration extends ConditionalExcept<
  BaseTextureConfiguration & Except<GameObjects.Components.TextureCrop, keyof BaseTextureConfiguration>,
  FunctionLike
> {}
