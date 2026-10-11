import type { ComputedSizeConfiguration } from "#src/models/configuration/components/ComputedSizeConfiguration";
import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { RenderableConfiguration } from "#src/models/configuration/shared/RenderableConfiguration";
import type { Types } from "phaser";
import type { Except } from "type-fest";

export interface TextConfiguration
  extends
    ComputedSizeConfiguration,
    Except<Types.GameObjects.Text.TextConfig, keyof Types.GameObjects.GameObjectConfig>,
    FlipConfiguration,
    RenderableConfiguration {
  text: string;
}
