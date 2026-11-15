import type { AssetLoader } from "#src/models/dungeons/loader/AssetLoader";

import { ImageKey } from "#shared/models/dungeons/keys/image/UI/ImageKey";
import blueButton from "#src/assets/dungeons/thirdParty/kenneysAssets/UIPack/blueButton00.png";
import blueButtonSelected from "#src/assets/dungeons/thirdParty/kenneysAssets/UIPack/blueButton01.png";
import barHorizontalBlueLeft from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalBlueLeft.png";
import barHorizontalBlueMid from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalBlueMid.png";
import barHorizontalBlueRight from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalBlueRight.png";
import barHorizontalGreenLeft from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalGreenLeft.png";
import barHorizontalGreenMid from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalGreenMid.png";
import barHorizontalGreenRight from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalGreenRight.png";
import barHorizontalShadowLeft from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalShadowLeft.png";
import barHorizontalShadowMid from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalShadowMid.png";
import barHorizontalShadowRight from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/barHorizontalShadowRight.png";
import customUI from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/customUI.png";
import glassPanel from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/glassPanel.png";
import glassPanelGreen from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/glassPanelGreen.png";
import glassPanelPurple from "#src/assets/dungeons/thirdParty/kenneysAssets/UISpaceExpansion/glassPanelPurple.png";
import cursor from "#src/assets/dungeons/UI/cursor/cursor.png";
import cursorWhite from "#src/assets/dungeons/UI/cursor/cursorWhite.png";
import { BallLoaderMap } from "#src/services/dungeons/loader/image/UI/BallLoaderMap";
import { ControlsLoaderMap } from "#src/services/dungeons/loader/image/UI/ControlsLoaderMap";
import { MonsterLoaderMap } from "#src/services/dungeons/loader/image/UI/MonsterLoaderMap";

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
} as const satisfies Record<ImageKey, AssetLoader>;
