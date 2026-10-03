// The pieces of the login interface the game's clips animate, by their paths under the page in its blocks, each the
// `data-clip-target` of the element drawing it; the page itself is the clips' root, the empty path. The white screen's
// Name ends in two spaces in the game's own data, which a clip's track names it by
export enum LoginInterfaceClipTarget {
  Bottom = "Bottom",
  Center = "Center",
  RatingBadge = "Center/BtnCADPA",
  Server = "Center/SwitchServer",
  Start = "Center/BtnStart",
  WhiteScreen = "BgBtn/ImgWhiteScreen  ",
}
