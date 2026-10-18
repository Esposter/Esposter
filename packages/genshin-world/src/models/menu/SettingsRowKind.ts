// What a settings row holds on its right: a choice from a list its caret opens, an action opening a page of its own, the
// Graphics quality and the game language, each a list of the world's own, the Volume of one of the three volume settings,
// Or a volume's slider the world does not back, drawn at the level the game's recording shows
export enum SettingsRowKind {
  Action = "Action",
  Choice = "Choice",
  Language = "Language",
  Quality = "Quality",
  Slider = "Slider",
  Volume = "Volume",
}
