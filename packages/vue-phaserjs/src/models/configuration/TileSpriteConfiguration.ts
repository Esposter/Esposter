import type { ComputedSizeConfiguration } from "#src/models/configuration/components/ComputedSizeConfiguration";
import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { RenderableConfiguration } from "#src/models/configuration/shared/RenderableConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface TileSpriteConfiguration
  extends
    ComputedSizeConfiguration,
    Except<
      Types.GameObjects.TileSprite.TileSpriteConfig,
      "frame" | "height" | "width" | keyof Types.GameObjects.GameObjectConfig
    >,
    FlipConfiguration,
    RenderableConfiguration,
    TextureConfiguration {}
