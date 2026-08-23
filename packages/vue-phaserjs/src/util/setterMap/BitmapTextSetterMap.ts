import type { BitmapTextConfiguration } from "#src/models/configuration/BitmapTextConfiguration";
import type { BitmapTextEventEmitsOptions } from "#src/models/emit/BitmapTextEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AlphaSetterMap } from "#src/util/setterMap/components/AlphaSetterMap";
import { BlendModeSetterMap } from "#src/util/setterMap/components/BlendModeSetterMap";
import { DepthSetterMap } from "#src/util/setterMap/components/DepthSetterMap";
import { MaskSetterMap } from "#src/util/setterMap/components/MaskSetterMap";
import { OriginSetterMap } from "#src/util/setterMap/components/OriginSetterMap";
import { RenderNodesSetterMap } from "#src/util/setterMap/components/RenderNodesSetterMap";
import { ScrollFactorSetterMap } from "#src/util/setterMap/components/ScrollFactorSetterMap";
import { TintSetterMap } from "#src/util/setterMap/components/TintSetterMap";
import { TransformSetterMap } from "#src/util/setterMap/components/TransformSetterMap";
import { VisibleSetterMap } from "#src/util/setterMap/components/VisibleSetterMap";
import { GlobalSetterMap } from "#src/util/setterMap/global/GlobalSetterMap";

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
