import type { IsoBoxConfiguration } from "@/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "@/models/emit/IsoBoxEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
// The faces and fill of an isometric shape, shared by IsoBox and IsoTriangle. The game object is typed structurally
// So both satisfy it: a Pick of either concrete class pins the setters' `this` return type to that class alone.
export const IsoSetterMap = {
  fillLeft: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFillStyle(gameObject.fillTop, value, gameObject.fillRight);
  },
  fillRight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFillStyle(gameObject.fillTop, gameObject.fillLeft, value);
  },
  fillTop: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFillStyle(value, gameObject.fillLeft, gameObject.fillRight);
  },
  projection: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setProjection(value);
  },
  showLeft: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFaces(gameObject.showTop, value, gameObject.showRight);
  },
  showRight: (gameObject) => (value) => {
    if (value === undefined) return;
    gameObject.setFaces(gameObject.showTop, gameObject.showLeft, value);
  },
  showTop: (gameObject) => (value) => {
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
