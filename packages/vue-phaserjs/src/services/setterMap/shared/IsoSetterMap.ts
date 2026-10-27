import type { IsoBoxConfiguration } from "#src/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "#src/models/emit/IsoBoxEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import { IsoSetter } from "#src/models/setterMap/shared/IsoSetter";

// The faces and fill of an isometric shape, shared by IsoBox and IsoTriangle. The game object is typed structurally
// So both satisfy it: a Pick of either concrete class pins the setters' `this` return type to that class alone.
export const IsoSetterMap = {
  [IsoSetter.FillLeft]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFillStyle(gameObject.fillTop, value, gameObject.fillRight);
  },
  [IsoSetter.FillRight]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFillStyle(gameObject.fillTop, gameObject.fillLeft, value);
  },
  [IsoSetter.FillTop]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFillStyle(value, gameObject.fillLeft, gameObject.fillRight);
  },
  [IsoSetter.Projection]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setProjection(value);
  },
  [IsoSetter.ShowLeft]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFaces(gameObject.showTop, value, gameObject.showRight);
  },
  [IsoSetter.ShowRight]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFaces(gameObject.showTop, gameObject.showLeft, value);
  },
  [IsoSetter.ShowTop]: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFaces(value, gameObject.showLeft, gameObject.showRight);
  },
} as const satisfies SetterMap<
  Pick<IsoBoxConfiguration, "fillLeft" | "fillRight" | "fillTop" | "projection" | "showLeft" | "showRight" | "showTop">,
  {
    fillLeft: number;
    fillRight: number;
    fillTop: number;
    setFaces: (showTop?: boolean, showLeft?: boolean, showRight?: boolean) => unknown;
    setFillStyle: (fillTop?: number, fillLeft?: number, fillRight?: number) => unknown;
    setProjection: (value: number) => unknown;
    showLeft: boolean;
    showRight: boolean;
    showTop: boolean;
  },
  IsoBoxEventEmitsOptions
>;
