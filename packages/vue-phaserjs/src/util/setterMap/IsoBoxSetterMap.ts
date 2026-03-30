import type { IsoBoxConfiguration } from "@/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "@/models/emit/IsoBoxEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { GlobalSetterMap } from "@/util/setterMap/global/GlobalSetterMap";
import { ShapeSetterMap } from "@/util/setterMap/shared/ShapeSetterMap";

export const IsoBoxSetterMap: SetterMap<IsoBoxConfiguration, GameObjects.IsoBox, IsoBoxEventEmitsOptions> = {
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
  ...ShapeSetterMap,
  ...GlobalSetterMap,
};
