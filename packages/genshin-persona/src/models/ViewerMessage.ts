// The ExAPI messages the plugin sends and takes, by the number the viewer names each with
export enum ViewerMessage {
  Register = 10_000,
  ModelEvent = 10_002,
  Bubble = 11_000,
  Motion = 13_200,
  ExpressionClear = 13_302,
  Sound = 13_500,
  SoundStop = 13_501,
}
