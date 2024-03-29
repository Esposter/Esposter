import cursor from "@/assets/dungeons/UI/cursor/cursor.png";
import cursorWhite from "@/assets/dungeons/UI/cursor/cursorWhite.png";
import blueButton from "@/assets/dungeons/kenneysAssets/UIPack/blueButton00.png";
import blueButtonSelected from "@/assets/dungeons/kenneysAssets/UIPack/blueButton01.png";
import barHorizontalGreenLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenLeft.png";
import barHorizontalGreenMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenMid.png";
import barHorizontalGreenRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenRight.png";
import barHorizontalShadowLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowLeft.png";
import barHorizontalShadowMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowMid.png";
import barHorizontalShadowRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowRight.png";
import customUI from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/customUI.png";
import glassPanel from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/glassPanel.png";
import glassPanelGreen from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/glassPanelGreen.png";
import glassPanelPurple from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/glassPanelPurple.png";
import { ImageKey } from "@/models/dungeons/keys/image/UI/ImageKey";
import { ControlsLoaderMap } from "@/models/dungeons/loader/image/UI/ControlsLoaderMap";
import { MonsterLoaderMap } from "@/models/dungeons/loader/image/UI/MonsterLoaderMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

export const ImageLoaderMap = {
  [ImageKey.BlueButton]: (scene) => scene.load.image(ImageKey.BlueButton, blueButton),
  [ImageKey.BlueButtonSelected]: (scene) => scene.load.image(ImageKey.BlueButtonSelected, blueButtonSelected),
  [ImageKey.Cursor]: (scene) => scene.load.image(ImageKey.Cursor, cursor),
  [ImageKey.CursorWhite]: (scene) => scene.load.image(ImageKey.CursorWhite, cursorWhite),
  [ImageKey.GlassPanel]: (scene) => scene.load.image(ImageKey.GlassPanel, glassPanel),
  [ImageKey.GlassPanelGreen]: (scene) => scene.load.image(ImageKey.GlassPanelGreen, glassPanelGreen),
  [ImageKey.GlassPanelPurple]: (scene) => scene.load.image(ImageKey.GlassPanelPurple, glassPanelPurple),
  [ImageKey.HealthBarBackground]: (scene) => scene.load.image(ImageKey.HealthBarBackground, customUI),
  [ImageKey.HealthBarLeftCap]: (scene) => scene.load.image(ImageKey.HealthBarLeftCap, barHorizontalGreenLeft),
  [ImageKey.HealthBarMiddle]: (scene) => scene.load.image(ImageKey.HealthBarMiddle, barHorizontalGreenMid),
  [ImageKey.HealthBarRightCap]: (scene) => scene.load.image(ImageKey.HealthBarRightCap, barHorizontalGreenRight),
  [ImageKey.HealthBarLeftCapShadow]: (scene) =>
    scene.load.image(ImageKey.HealthBarLeftCapShadow, barHorizontalShadowLeft),
  [ImageKey.HealthBarMiddleShadow]: (scene) => scene.load.image(ImageKey.HealthBarMiddleShadow, barHorizontalShadowMid),
  [ImageKey.HealthBarRightCapShadow]: (scene) =>
    scene.load.image(ImageKey.HealthBarRightCapShadow, barHorizontalShadowRight),
  ...ControlsLoaderMap,
  ...MonsterLoaderMap,
} as const satisfies Record<ImageKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
