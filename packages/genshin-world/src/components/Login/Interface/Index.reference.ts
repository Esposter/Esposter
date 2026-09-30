import type { ComponentReference } from "genshin-interface";

import { GameSourceKind } from "genshin-interface";

// The login interface's sources in the game's data, what every search over them found, and what is still open. Its
// Layout is the RectTransforms under `LoginMainPage` in units of the canvas's 1600 by 900 reference
export const reference: ComponentReference = {
  findings: [
    {
      found:
        "In 11790361 (838 RectTransforms, with BtnHelp, BtnLogin, BtnRepair, BtnSetting and DoorNode); 16000354 holds 51 and 03544574 334, none of the page's: GameObjects are not in the asset index, so a block is found through an indexed asset beside them, the Ani_LoginMainPage_Waiting clips",
      search:
        "Which block holds the login interface, dumping the RectTransforms and GameObjects of 16000354, 11790361 and 03544574",
    },
    {
      found:
        "Its JSON export has the Transform fields alone; its raw export's last 40 bytes are the anchors, anchored position, size and pivot, and the raw and JSON files share their numbering",
      search: "Where a RectTransform's anchors are",
    },
    {
      found:
        "A RectTransform's own path ID is not in its dump: it is its GameObject's first component, so the tree joins through the GameObjects",
      search: "How the page's tree is built from the dumps",
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
      found:
        "Bottom also holds LoadingDesc, the 58 unit loading row at its top; the prompt is BtnPressStart, a MonoUIContainer whose prefab loads at run time, so its band is measured: 38 units over the foot",
      search: "Where the loading row and the click-to-begin prompt sit in the tree",
    },
    {
      found:
        "The build string's rect stretches across the account row with its pivot at the middle; placing it from the pivot's point on its whole length slid it half the row left, off the screen, and the backdrop compare drew the recording's own string over the gap",
      search: "Why the build string disappeared",
    },
    {
      found:
        "The bar is full by 8 s, folds over 9 to 9.5 s with its words, and the flight runs on bare until the door rises at 11.75 s; the bar opened at 2.5 s and filled as the recording's own load went, so its pace is loading's, not a floor",
      search: "The recording's loading end at 4 frames a second (8 s to 13 s)",
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
    "The fitted clips played (LoginInterfaceClipMap through playInterfaceClip): WhiteCurtain and FadeIn on arriving, StartFadeIn and StartFadeOut on the title, FadeOut on entering, each piece named by a data-clip-target of its game path",
    "Every screen laid out from its fitted RectTransform tree (the interface layout proposal) in place of LoginInterfaceRectMap",
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
