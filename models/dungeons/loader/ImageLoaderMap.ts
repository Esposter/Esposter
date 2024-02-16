import cursor from "@/assets/dungeons/UI/cursor/cursor.png";
import base from "@/assets/dungeons/UI/joystick/base.png";
import thumb from "@/assets/dungeons/UI/joystick/thumb.png";
import battleForestBackground from "@/assets/dungeons/battle/forestBackground.png";
import carnodusk from "@/assets/dungeons/battle/monsters/carnodusk.png";
import iguanignite from "@/assets/dungeons/battle/monsters/iguanignite.png";
import barHorizontalGreenLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenLeft.png";
import barHorizontalGreenMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenMid.png";
import barHorizontalGreenRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenRight.png";
import barHorizontalShadowLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowLeft.png";
import barHorizontalShadowMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowMid.png";
import barHorizontalShadowRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowRight.png";
import customUI from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/customUI.png";
import worldHomeForeground from "@/assets/dungeons/world/home/foreground.png";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type Loader } from "phaser";

export const ImageLoaderMap: Record<ImageKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [ImageKey.BattleForestBackground]: (scene) =>
    scene.load.image(ImageKey.BattleForestBackground, battleForestBackground),
  [ImageKey.WorldHomeForeground]: (scene) => scene.load.image(ImageKey.WorldHomeForeground, worldHomeForeground),

  [ImageKey.HealthBarBackground]: (scene) => scene.load.image(ImageKey.HealthBarBackground, customUI),
  [ImageKey.HealthBarLeftCap]: (scene) => scene.load.image(ImageKey.HealthBarLeftCap, barHorizontalGreenLeft),
  [ImageKey.HealthBarMiddle]: (scene) => scene.load.image(ImageKey.HealthBarMiddle, barHorizontalGreenMid),
  [ImageKey.HealthBarRightCap]: (scene) => scene.load.image(ImageKey.HealthBarRightCap, barHorizontalGreenRight),
  [ImageKey.HealthBarLeftCapShadow]: (scene) =>
    scene.load.image(ImageKey.HealthBarLeftCapShadow, barHorizontalShadowLeft),
  [ImageKey.HealthBarMiddleShadow]: (scene) => scene.load.image(ImageKey.HealthBarMiddleShadow, barHorizontalShadowMid),
  [ImageKey.HealthBarRightCapShadow]: (scene) =>
    scene.load.image(ImageKey.HealthBarRightCapShadow, barHorizontalShadowRight),
  // Monsters
  [ImageKey.Carnodusk]: (scene) => scene.load.image(ImageKey.Carnodusk, carnodusk),
  [ImageKey.Iguanignite]: (scene) => scene.load.image(ImageKey.Iguanignite, iguanignite),

  [ImageKey.Cursor]: (scene) => scene.load.image(ImageKey.Cursor, cursor),
  [ImageKey.Base]: (scene) => scene.load.image(ImageKey.Base, base),
  [ImageKey.Thumb]: (scene) => scene.load.image(ImageKey.Thumb, thumb),
};
