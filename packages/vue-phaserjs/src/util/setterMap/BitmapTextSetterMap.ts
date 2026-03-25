import type { BitmapTextConfiguration } from "@/models/configuration/BitmapTextConfiguration";
import type { BitmapTextEventEmitsOptions } from "@/models/emit/BitmapTextEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "@/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "@/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "@/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "@/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "@/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "@/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "@/util/setterMap/components/ScrollFactorSetterMap";
import { TintSetterMap } from "@/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "@/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "@/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";

export const BitmapTextSetterMap: SetterMap<
  BitmapTextConfiguration,
  GameObjects.BitmapText,
  BitmapTextEventEmitsOptions
> = {
  align: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.align = value;
  },
  dropShadow: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setDropShadow(...value);
  },
  font: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setFont(value);
  },
  fontSize: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFontSize(value);
  },
  letterSpacing: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setLetterSpacing(value);
  },
  lineSpacing: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setLineSpacing(value);
  },
  maxWidth: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setMaxWidth(value);
  },
  text: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setText(value);
  },
  wordWrapCharCode: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.wordWrapCharCode = value;
  },
  ...AlphaSetterMap,
  ...BlendModeSetterMap,
  ...DepthSetterMap,
  ...MaskSetterMap,
  ...OriginSetterMap,
  ...RenderNodesSetterMap,
  ...ScrollFactorSetterMap,
  ...TintSetterMap,
  ...TransformSetterMap,
  ...VisibleSetterMap,
  ...GlobalSetterMap,
};
