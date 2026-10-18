// What a settings row holds on its right: a choice from a list its caret opens, an action opening a page of its own, the
// Graphics quality and the game language, each a list of the world's own, a Range or the Volume of a setting the world
// Keeps, a slider the world does not back, drawn at the level the game's recording shows, or a Toggle the world flips
export enum SettingsRowKind {
  Action = "Action",
  Choice = "Choice",
  Language = "Language",
  Quality = "Quality",
  Range = "Range",
  Slider = "Slider",
  Toggle = "Toggle",
  Volume = "Volume",
}
