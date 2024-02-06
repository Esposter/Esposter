import { type SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import { type SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { AlphaSetterMap } from "@/lib/phaser/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/lib/phaser/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/lib/phaser/util/setterMap/components/DepthSetterMap";
import { FlipSetterMap } from "@/lib/phaser/util/setterMap/components/FlipSetterMap";
import { MaskSetterMap } from "@/lib/phaser/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/lib/phaser/util/setterMap/components/OriginSetterMap";
import { PipelineSetterMap } from "@/lib/phaser/util/setterMap/components/PipelineSetterMap";
import { ScrollFactorSetterMap } from "@/lib/phaser/util/setterMap/components/ScrollFactorSetterMap";
import { SizeSetterMap } from "@/lib/phaser/util/setterMap/components/SizeSetterMap";
import { TextureSetterMap } from "@/lib/phaser/util/setterMap/components/TextureSetterMap";
import { TintSetterMap } from "@/lib/phaser/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/lib/phaser/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/lib/phaser/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/lib/phaser/util/setterMap/global/GlobalSetterMap";
import { type GameObjects } from "phaser";

export const SpriteSetterMap: SetterMap<SpriteConfiguration, GameObjects.Sprite, SpriteEventEmitsOptions> = {
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...FlipSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...PipelineSetterMap,
  ...ScrollFactorSetterMap,
  ...SizeSetterMap,
  ...TextureSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
  frame: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFrame(value);
  },
  isPlayingAnimation: (gameObject) => (value) => {
    if (value === undefined) return;
    else if (value) gameObject.play(gameObject.texture);
    else gameObject.stop();
  },
};
