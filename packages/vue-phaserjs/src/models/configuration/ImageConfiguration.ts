import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { SizeConfiguration } from "#src/models/configuration/components/SizeConfiguration";
import type { TextureCropConfiguration } from "#src/models/configuration/components/TextureCropConfiguration";
import type { RenderableConfiguration } from "#src/models/configuration/shared/RenderableConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface ImageConfiguration
  extends
    Except<Types.GameObjects.Sprite.SpriteConfig, "frame" | keyof Types.GameObjects.GameObjectConfig>,
    FlipConfiguration,
    RenderableConfiguration,
    SizeConfiguration,
    TextureCropConfiguration {}
