import type { ComponentReference } from "#src/models/reference/ComponentReference";

import { GameSourceKind } from "#src/models/reference/GameSourceKind";

// The login interface's sources in the game's data, what every search over them found, and what is still open. Its
// Layout is the RectTransforms under `LoginMainPage` in units of the canvas's 1600 by 900 reference
export const reference: ComponentReference = {
  findings: [
    {
      found: "In 11790361, beside the Ani_LoginMainPage_Waiting clips: GameObjects are not in the asset index",
      search: "Which block holds the login interface",
    },
    {
      found: "1600 by 900, drawn 1.2 times at 1080 high: the server bar's top is 128 plus 32 units up, 192 pixels",
      search: "The canvas's reference resolution",
    },
    {
      found: "Placed by a layout group at run time: their RectTransforms read zero, so their spacing is measured",
      search: "The corner buttons' positions",
    },
    {
      found: "Anchored to the screen's foot, not its middle: the foot rides up a window narrower than 16:9 otherwise",
      search: "Why the footer rose on a narrow window",
    },
    {
      found: "m_Alpha, m_IsActive, m_Color.a, m_AnchoredPosition.x, m_SizeDelta.x and m_SizeDelta.y, by CRC32",
      search: "The properties the page's clips animate",
    },
  ],
  open: [
    "The canvas's match between width and height on a window narrower than 16:9: the scaler is a script",
    "The layout groups' spacing, measured on the recordings",
    "Each button's hover and pressed states, from the recordings and the page's sprites",
  ],
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
};
