import type { BitmapTextConfiguration } from "#src/models/configuration/BitmapTextConfiguration";
import type { BitmapTextEventEmitsOptions } from "#src/models/emit/BitmapTextEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { RenderableSetterMap } from "#src/services/setterMap/shared/RenderableSetterMap";

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
  ...RenderableSetterMap,
};
