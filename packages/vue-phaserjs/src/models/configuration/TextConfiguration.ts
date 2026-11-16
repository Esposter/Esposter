import type { ComputedSizeConfiguration } from "#src/models/configuration/components/ComputedSizeConfiguration";
import type { FlipConfiguration } from "#src/models/configuration/components/FlipConfiguration";
import type { RenderableConfiguration } from "#src/models/configuration/shared/RenderableConfiguration";
import type { Types } from "phaser";
import type { Except, UndefinedOnPartial } from "type-fest";

export interface TextConfiguration
  extends
    ComputedSizeConfiguration,
    Except<Types.GameObjects.Text.TextConfig, "style" | keyof Types.GameObjects.GameObjectConfig>,
    FlipConfiguration,
    RenderableConfiguration {
  // A style field left undefined keeps the default style's value, so it may be handed undefined
  style?: undefined | UndefinedOnPartial<Types.GameObjects.Text.TextStyle>;
  text: string;
}
