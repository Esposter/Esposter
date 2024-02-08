import cursor from "@/assets/dungeons/UI/cursor.png";
import forestBattleBackground from "@/assets/dungeons/backgrounds/battle/forest.png";
import worldBackground from "@/assets/dungeons/backgrounds/world/background.png";
import worldForeground from "@/assets/dungeons/backgrounds/world/foreground.png";
import barHorizontalGreenLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenLeft.png";
import barHorizontalGreenMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenMid.png";
import barHorizontalGreenRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenRight.png";
import barHorizontalShadowLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowLeft.png";
import barHorizontalShadowMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowMid.png";
import barHorizontalShadowRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowRight.png";
import customUI from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/customUI.png";
import carnodusk from "@/assets/dungeons/monsters/carnodusk.png";
import iguanignite from "@/assets/dungeons/monsters/iguanignite.png";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { type SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
import { type Loader } from "phaser";

export const ImageLoaderMap: Record<ImageKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [ImageKey.ForestBattleBackground]: (scene) =>
    scene.load.image(ImageKey.ForestBattleBackground, forestBattleBackground),
  [ImageKey.WorldBackground]: (scene) => scene.load.image(ImageKey.WorldBackground, worldBackground),
  [ImageKey.WorldForeground]: (scene) => scene.load.image(ImageKey.WorldForeground, worldForeground),

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
};
