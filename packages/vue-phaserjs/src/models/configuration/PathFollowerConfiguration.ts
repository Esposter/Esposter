import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { PathFollowerComponentConfiguration } from "#src/models/configuration/components/PathFollowerComponentConfiguration";
import type { SizeConfiguration } from "#src/models/configuration/components/SizeConfiguration";
import type { TextureConfiguration } from "#src/models/configuration/components/TextureConfiguration";
import type { RenderableConfiguration } from "#src/models/configuration/shared/RenderableConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface PathFollowerConfiguration
  extends
    Except<Types.GameObjects.PathFollower.PathConfig, "rotateToPath">,
    FlipConfiguration,
    PathFollowerComponentConfiguration,
    RenderableConfiguration,
    SizeConfiguration,
    TextureConfiguration {}
