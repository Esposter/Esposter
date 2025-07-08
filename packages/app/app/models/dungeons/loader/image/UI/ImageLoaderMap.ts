import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ImageKey } from "#shared/models/dungeons/keys/image/UI/ImageKey";
import blueButton from "@/assets/dungeons/thirdParty/kenneysAssets/UIPack/blueButton00.png";
import blueButtonSelected from "@/assets/dungeons/thirdParty/kenneysAssets/UIPack/blueButton01.png";
import barHorizontalBlueLeft from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalBlueLeft.png";
import barHorizontalBlueMid from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalBlueMid.png";
import barHorizontalBlueRight from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalBlueRight.png";
import barHorizontalGreenLeft from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalGreenLeft.png";
import barHorizontalGreenMid from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalGreenMid.png";
import barHorizontalGreenRight from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalGreenRight.png";
import barHorizontalShadowLeft from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalShadowLeft.png";
import barHorizontalShadowMid from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalShadowMid.png";
import barHorizontalShadowRight from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalShadowRight.png";
import customUI from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/customUI.png";
import glassPanel from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/glassPanel.png";
import glassPanelGreen from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/glassPanelGreen.png";
import glassPanelPurple from "@/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/glassPanelPurple.png";
import cursor from "@/assets/dungeons/UI/cursor/cursor.png";
import cursorWhite from "@/assets/dungeons/UI/cursor/cursorWhite.png";
import { BallLoaderMap } from "@/models/dungeons/loader/image/UI/BallLoaderMap";
import { ControlsLoaderMap } from "@/models/dungeons/loader/image/UI/ControlsLoaderMap";
import { MonsterLoaderMap } from "@/models/dungeons/loader/image/UI/MonsterLoaderMap";

export const ImageLoaderMap = {
  [ImageKey.BarLeftCapShadow]: (scene) => scene.load.image(ImageKey.BarLeftCapShadow, barHorizontalShadowLeft),
  [ImageKey.BarMiddleShadow]: (scene) => scene.load.image(ImageKey.BarMiddleShadow, barHorizontalShadowMid),
  [ImageKey.BarRightCapShadow]: (scene) => scene.load.image(ImageKey.BarRightCapShadow, barHorizontalShadowRight),
  [ImageKey.BlueButton]: (scene) => scene.load.image(ImageKey.BlueButton, blueButton),
  [ImageKey.BlueButtonSelected]: (scene) => scene.load.image(ImageKey.BlueButtonSelected, blueButtonSelected),
  [ImageKey.Cursor]: (scene) => scene.load.image(ImageKey.Cursor, cursor),
  [ImageKey.CursorWhite]: (scene) => scene.load.image(ImageKey.CursorWhite, cursorWhite),
  [ImageKey.ExperienceBarLeftCap]: (scene) => scene.load.image(ImageKey.ExperienceBarLeftCap, barHorizontalBlueLeft),
  [ImageKey.ExperienceBarMiddle]: (scene) => scene.load.image(ImageKey.ExperienceBarMiddle, barHorizontalBlueMid),
  [ImageKey.ExperienceBarRightCap]: (scene) => scene.load.image(ImageKey.ExperienceBarRightCap, barHorizontalBlueRight),
  [ImageKey.GlassPanel]: (scene) => scene.load.image(ImageKey.GlassPanel, glassPanel),
  [ImageKey.GlassPanelGreen]: (scene) => scene.load.image(ImageKey.GlassPanelGreen, glassPanelGreen),
  [ImageKey.GlassPanelPurple]: (scene) => scene.load.image(ImageKey.GlassPanelPurple, glassPanelPurple),
  [ImageKey.HealthBarBackground]: (scene) => scene.load.image(ImageKey.HealthBarBackground, customUI),
  [ImageKey.HealthBarLeftCap]: (scene) => scene.load.image(ImageKey.HealthBarLeftCap, barHorizontalGreenLeft),
  [ImageKey.HealthBarMiddle]: (scene) => scene.load.image(ImageKey.HealthBarMiddle, barHorizontalGreenMid),
  [ImageKey.HealthBarRightCap]: (scene) => scene.load.image(ImageKey.HealthBarRightCap, barHorizontalGreenRight),
  ...BallLoaderMap,
  ...ControlsLoaderMap,
  ...MonsterLoaderMap,
} as const satisfies Record<ImageKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
