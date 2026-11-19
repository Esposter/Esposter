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
import { BallAssetMap } from "#src/services/dungeons/loader/image/UI/BallAssetMap";
import { ControlsAssetMap } from "#src/services/dungeons/loader/image/UI/ControlsAssetMap";
import { MonsterAssetMap } from "#src/services/dungeons/loader/image/UI/MonsterAssetMap";

export const ImageAssetMap = {
  [ImageKey.BarLeftCapShadow]: barHorizontalShadowLeft,
  [ImageKey.BarMiddleShadow]: barHorizontalShadowMid,
  [ImageKey.BarRightCapShadow]: barHorizontalShadowRight,
  [ImageKey.BlueButton]: blueButton,
  [ImageKey.BlueButtonSelected]: blueButtonSelected,
  [ImageKey.Cursor]: cursor,
  [ImageKey.CursorWhite]: cursorWhite,
  [ImageKey.ExperienceBarLeftCap]: barHorizontalBlueLeft,
  [ImageKey.ExperienceBarMiddle]: barHorizontalBlueMid,
  [ImageKey.ExperienceBarRightCap]: barHorizontalBlueRight,
  [ImageKey.GlassPanel]: glassPanel,
  [ImageKey.GlassPanelGreen]: glassPanelGreen,
  [ImageKey.GlassPanelPurple]: glassPanelPurple,
  [ImageKey.HealthBarBackground]: customUI,
  [ImageKey.HealthBarLeftCap]: barHorizontalGreenLeft,
  [ImageKey.HealthBarMiddle]: barHorizontalGreenMid,
  [ImageKey.HealthBarRightCap]: barHorizontalGreenRight,
  ...BallAssetMap,
  ...ControlsAssetMap,
  ...MonsterAssetMap,
} as const satisfies Record<ImageKey, string>;
