import type { AlphaConfiguration } from "#src/models/configuration/components/AlphaConfiguration";
import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { OriginConfiguration } from "#src/models/configuration/components/OriginConfiguration";
import type { RenderNodesConfiguration } from "#src/models/configuration/components/RenderNodesConfiguration";
import type { SizeConfiguration } from "#src/models/configuration/components/SizeConfiguration";
import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { TintConfiguration } from "#src/models/configuration/components/TintConfiguration";
import type { GlobalConfiguration } from "#src/models/configuration/global/GlobalConfiguration";
import type { AnimationConfiguration } from "#src/models/configuration/shared/AnimationConfiguration";
import type { SceneObjectConfiguration } from "#src/models/configuration/shared/SceneObjectConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface SpriteConfiguration
  extends
    AlphaConfiguration,
    AnimationConfiguration,
    Except<Types.GameObjects.Sprite.SpriteConfig, "anims" | "frame" | keyof Types.GameObjects.GameObjectConfig>,
    FlipConfiguration,
    GlobalConfiguration,
    OriginConfiguration,
    RenderNodesConfiguration,
    SceneObjectConfiguration,
    SizeConfiguration,
    TextureConfiguration,
    TintConfiguration {}
