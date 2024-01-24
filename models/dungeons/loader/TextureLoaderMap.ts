import cursor from "@/assets/dungeons/UI/cursor.png";
import forestBackground from "@/assets/dungeons/battleBackgrounds/forestBackground.png";
import barHorizontalGreenLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenLeft.png";
import barHorizontalGreenMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenMid.png";
import barHorizontalGreenRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenRight.png";
import barHorizontalShadowLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowLeft.png";
import barHorizontalShadowMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowMid.png";
import barHorizontalShadowRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowRight.png";
import customUI from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/customUI.png";
import carnodusk from "@/assets/dungeons/monsters/carnodusk.png";
import iguanignite from "@/assets/dungeons/monsters/iguanignite.png";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
import { type Loader } from "phaser";

export const TextureLoaderMap: Record<TextureManagerKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin> = {
  [TextureManagerKey.ForestBackground]: (scene) =>
    scene.load.image(TextureManagerKey.ForestBackground, forestBackground),
  [TextureManagerKey.HealthBarBackground]: (scene) => scene.load.image(TextureManagerKey.HealthBarBackground, customUI),
  [TextureManagerKey.HealthBarLeftCap]: (scene) =>
    scene.load.image(TextureManagerKey.HealthBarLeftCap, barHorizontalGreenLeft),
  [TextureManagerKey.HealthBarMiddle]: (scene) =>
    scene.load.image(TextureManagerKey.HealthBarMiddle, barHorizontalGreenMid),
  [TextureManagerKey.HealthBarRightCap]: (scene) =>
    scene.load.image(TextureManagerKey.HealthBarRightCap, barHorizontalGreenRight),
  [TextureManagerKey.HealthBarLeftCapShadow]: (scene) =>
    scene.load.image(TextureManagerKey.HealthBarLeftCapShadow, barHorizontalShadowLeft),
  [TextureManagerKey.HealthBarMiddleShadow]: (scene) =>
    scene.load.image(TextureManagerKey.HealthBarMiddleShadow, barHorizontalShadowMid),
  [TextureManagerKey.HealthBarRightCapShadow]: (scene) =>
    scene.load.image(TextureManagerKey.HealthBarRightCapShadow, barHorizontalShadowRight),
  [TextureManagerKey.Carnodusk]: (scene) => scene.load.image(TextureManagerKey.Carnodusk, carnodusk),
  [TextureManagerKey.Iguanignite]: (scene) => scene.load.image(TextureManagerKey.Iguanignite, iguanignite),
  [TextureManagerKey.Cursor]: (scene) => scene.load.image(TextureManagerKey.Cursor, cursor),
};
