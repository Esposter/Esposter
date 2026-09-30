import type { CanvasRect } from "genshin-interface";

import { LoginInterfaceRect } from "#src/models/login/LoginInterfaceRect";

// Where the login interface's pieces sit, as the game's RectTransforms under `LoginMainPage` place them in canvas units
// (Login/Interface/Index.reference.ts's source of each named beside it). The foot is anchored to the screen's bottom,
// So it stays there on any window, and the button columns and the account row ride in it
export const LoginInterfaceRectMap: Record<LoginInterfaceRect, CanvasRect> = {
  // Source: bottom
  [LoginInterfaceRect.Bottom]: {
    anchorMax: [1, 0],
    anchorMin: [0, 0],
    pivot: [0, 0],
    position: [0, 0],
    size: [0, 128],
  },
  // Source: bottom (CurrentAccount under it)
  [LoginInterfaceRect.CurrentAccount]: {
    anchorMax: [1, 1],
    anchorMin: [0, 0],
    pivot: [0, 0.5],
    position: [0, -29],
    size: [0, -58],
  },
  // Source: leftButtons
  [LoginInterfaceRect.LeftButtons]: {
    anchorMax: [0, 0],
    anchorMin: [0, 0],
    pivot: [0, 0],
    position: [54, 54],
    size: [52, 520],
  },
  // Source: rightButtons
  [LoginInterfaceRect.RightButtons]: {
    anchorMax: [1, 0],
    anchorMin: [1, 0],
    pivot: [1, 0],
    position: [-54, 54],
    size: [52, 520],
  },
  // Source: serverBar
  [LoginInterfaceRect.ServerBar]: {
    anchorMax: [0.5, 0],
    anchorMin: [0.5, 0],
    pivot: [0.5, 0.5],
    position: [0, 128],
    size: [380, 64],
  },
  // Source: version
  [LoginInterfaceRect.Version]: {
    anchorMax: [1, 0],
    anchorMin: [0, 0],
    pivot: [0.5, 0],
    position: [0, 0],
    size: [-120, 40],
  },
};
