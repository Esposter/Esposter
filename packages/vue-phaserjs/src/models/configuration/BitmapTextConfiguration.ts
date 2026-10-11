import type { RenderableConfiguration } from "#src/models/configuration/shared/RenderableConfiguration";
import type { GameObjects } from "phaser";

export interface BitmapTextConfiguration
  extends
    Pick<
      GameObjects.BitmapText,
      "align" | "font" | "fontSize" | "letterSpacing" | "lineSpacing" | "text" | "wordWrapCharCode"
    >,
    RenderableConfiguration {
  dropShadow: Parameters<GameObjects.BitmapText["setDropShadow"]>;
  maxWidth: Parameters<GameObjects.BitmapText["setMaxWidth"]>[0];
}
