import type { BitmapTextConfiguration } from "#src/models/configuration/BitmapTextConfiguration";
import type { BitmapTextEventEmitsOptions } from "#src/models/emit/BitmapTextEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { BitmapTextSetter } from "#src/models/setterMap/BitmapTextSetter";
import { RenderableSetterMap } from "#src/services/setterMap/shared/RenderableSetterMap";

export const BitmapTextSetterMap: SetterMap<
  BitmapTextConfiguration,
  GameObjects.BitmapText,
  BitmapTextEventEmitsOptions
> = {
  [BitmapTextSetter.Align]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.align = value;
  },
  [BitmapTextSetter.DropShadow]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setDropShadow(...value);
  },
  [BitmapTextSetter.Font]: (gameObject) => (value) => {
    if (!value) return;
    gameObject.setFont(value);
  },
  [BitmapTextSetter.FontSize]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFontSize(value);
  },
  [BitmapTextSetter.LetterSpacing]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setLetterSpacing(value);
  },
  [BitmapTextSetter.LineSpacing]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setLineSpacing(value);
  },
  [BitmapTextSetter.MaxWidth]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setMaxWidth(value);
  },
  [BitmapTextSetter.Text]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setText(value);
  },
  [BitmapTextSetter.WordWrapCharCode]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.wordWrapCharCode = value;
  },
  ...RenderableSetterMap,
};
