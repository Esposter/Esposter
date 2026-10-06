import type { ComponentReference } from "genshin-interface";

import { layoutTopic } from "#src/components/Login/Interface/Layout.reference";
import { motionTopic } from "#src/components/Login/Interface/Motion.reference";
import { GameSourceKind } from "genshin-interface";

// The login interface's sources in the game's data, and its topics, each with what every investigation found and
// What is still open. Its layout is the RectTransforms under `LoginMainPage` in units of the canvas's 1600 by 900
// Reference, fitted into `interfaceRects.json` by path
export const reference: ComponentReference = {
  sources: {
    bottom: {
      block: "00/11790361.blk",
      kind: GameSourceKind.RectTransform,
      name: "LoginMainPage/GrpLogin/Bottom",
      role: "The foot: anchored to the screen's bottom across its width, 128 units high; holds the account, the build string and both button columns",
    },
    fadeIn: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LoginMainPage_FadeIn",
      role: "The page appearing: its scale, alphas and colours over 1.5 seconds",
    },
    leftButtons: {
      block: "00/11790361.blk",
      kind: GameSourceKind.RectTransform,
      name: "LoginMainPage/GrpLogin/Bottom/LeftButtons",
      role: "The lower left column, 54 units in from the side and the foot, 52 wide: Playgo, BtnDownload, BtnQuit_PC",
    },
    page: {
      block: "00/11790361.blk",
      kind: GameSourceKind.RectTransform,
      name: "LoginMainPage",
      role: "The interface's root, stretched over the screen",
    },
    progressBarFadeIn: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LoginProgressBar_FadeIn",
      role: "The progress bar appearing: its positions, sizes and alphas",
    },
    rightButtons: {
      block: "00/11790361.blk",
      kind: GameSourceKind.RectTransform,
      name: "LoginMainPage/GrpLogin/Bottom/RightButtons",
      role: "The lower right column, 54 units in from the side and the foot, 52 wide: setting, repair, notice, logout, login",
    },
    serverBar: {
      block: "00/11790361.blk",
      kind: GameSourceKind.RectTransform,
      name: "LoginMainPage/GrpLogin/Center/SwitchServer/BtnSwitchServer",
      role: "The server bar: anchored to the foot's middle, 128 units up, 380 by 64",
    },
    startFadeIn: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LoginMainPage_Start_FadeIn",
      role: "The title appearing: its alphas, colours and size",
    },
    startFadeOut: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LoginMainPage_Start_FadeOut",
      role: "The title going on a click: its scale, alphas and size",
    },
    tip: {
      block: "00/11790361.blk",
      kind: GameSourceKind.RectTransform,
      name: "LoginMainPage/GrpLogin/Center/TxtTip",
      role: "The tip line, anchored to the top across the screen",
    },
    version: {
      block: "00/11790361.blk",
      kind: GameSourceKind.RectTransform,
      name: "LoginMainPage/GrpLogin/Bottom/CurrentAccount/TxtVersion",
      role: "The build string, at the account row's foot, 40 units high",
    },
    whiteCurtain: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LoginMainPage_WhiteCurtain",
      role: "The white the screen turns: four alphas",
    },
  },
  topics: { layout: layoutTopic, motion: motionTopic },
};
