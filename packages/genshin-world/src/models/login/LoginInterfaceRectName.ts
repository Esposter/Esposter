// The pieces of the login interface the screen places its own by, each by its path under the game's interface root. The
// White screen's name ends in two spaces in the game's own data, which its rect is keyed by
export enum LoginInterfaceRectName {
  Background = "GrpLogin/BgBtn",
  Bottom = "GrpLogin/Bottom",
  Center = "GrpLogin/Center",
  CurrentAccount = "GrpLogin/Bottom/CurrentAccount",
  LeftButtons = "GrpLogin/Bottom/LeftButtons",
  Login = "GrpLogin",
  PressStart = "GrpLogin/Center/SwitchServer/BtnPressStart",
  RatingBadge = "GrpLogin/Center/BtnCADPA",
  RightButtons = "GrpLogin/Bottom/RightButtons",
  Server = "GrpLogin/Center/SwitchServer",
  Start = "GrpLogin/Center/BtnStart",
  SwitchServer = "GrpLogin/Center/SwitchServer/BtnSwitchServer",
  Version = "GrpLogin/Bottom/CurrentAccount/TxtVersion",
  WhiteScreen = "GrpLogin/BgBtn/ImgWhiteScreen  ",
}
