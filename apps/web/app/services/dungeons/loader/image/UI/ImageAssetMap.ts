import { FileKey } from "#shared/generated/phaser/FileKey";
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
  [FileKey.ThirdPartyKenneysAssetsUIPackBlueButton00]: blueButton,
  [FileKey.ThirdPartyKenneysAssetsUIPackBlueButton01]: blueButtonSelected,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueLeft]: barHorizontalBlueLeft,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueMid]: barHorizontalBlueMid,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalBlueRight]: barHorizontalBlueRight,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenLeft]: barHorizontalGreenLeft,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenMid]: barHorizontalGreenMid,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalGreenRight]: barHorizontalGreenRight,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowLeft]: barHorizontalShadowLeft,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowMid]: barHorizontalShadowMid,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowRight]: barHorizontalShadowRight,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionCustomUI]: customUI,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanel]: glassPanel,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanelGreen]: glassPanelGreen,
  [FileKey.ThirdPartyKenneysAssetsUISpaceExpansionGlassPanelPurple]: glassPanelPurple,
  [FileKey.UICursorCursor]: cursor,
  [FileKey.UICursorCursorWhite]: cursorWhite,
  ...BallAssetMap,
  ...ControlsAssetMap,
  ...MonsterAssetMap,
} as const satisfies Partial<Record<FileKey, string>>;
