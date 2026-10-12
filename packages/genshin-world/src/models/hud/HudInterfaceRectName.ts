// The pieces of the HUD's tree the screen places its own by, each by its path under the game's interface root
export enum HudInterfaceRectName {
  ActionButtons = "GrpMainPage/GrpActionBtn",
  BackMap = "GrpMainPage/MapInfo/GrpMiniMap/GrpBackMap",
  HealthBarContainer = "GrpMainPage/GameInfo/HPBarContainer",
  InputController = "GrpMainPage/InputController",
  // The minimap's marks over its back: the character's arrow, the view's fan and the north mark, which the game names
  // Its south and draws as an N
  LocalAvatarMark = "GrpMainPage/MapInfo/GrpMiniMap/GrpMap/MarkContainer/Layer4/MarkLocalAvatar",
  MainPage = "GrpMainPage",
  MapInfo = "GrpMainPage/MapInfo",
  MapMarks = "GrpMainPage/MapInfo/GrpMiniMap/GrpMap",
  MiniMap = "GrpMainPage/MapInfo/GrpMiniMap",
  MoveJoystick = "GrpMainPage/InputController/MoveJoystick_H4",
  MoveJoystickExtendTouch = "GrpMainPage/InputController/MoveJoystick_H4/ExtendTouch",
  MoveJoystickGroup = "GrpMainPage/InputController/MoveJoystick_H4/GrpJoyStick",
  MoveJoystickHead = "GrpMainPage/InputController/MoveJoystick_H4/GrpJoyStick/ImgJoyStickHead",
  PlayerProfileButton = "GrpMainPage/MapInfo/BtnPlayerProfile",
  SightFanMark = "GrpMainPage/MapInfo/GrpMiniMap/GrpMap/MarkContainer/Layer4/MarkSightFan",
  SouthImage = "GrpMainPage/MapInfo/GrpMiniMap/GrpMap/MarkContainer/Layer4/MarkSouth/ImgSouth",
  SouthMark = "GrpMainPage/MapInfo/GrpMiniMap/GrpMap/MarkContainer/Layer4/MarkSouth",
  TeamButtonContainer = "GrpMainPage/TeamBtnContainer",
  TopPanel = "GrpMainPage/GrpMainBtn/GrpMainToggle/GrpTopPanel",
}
