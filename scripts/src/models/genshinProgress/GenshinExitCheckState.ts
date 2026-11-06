// Where an exit check stands: met when it was read and holds, not met with the items that fail it named, or not measurable
// When no command can read it. A quest's line is scripted when a session script names the quest
export enum GenshinExitCheckState {
  Met = "met",
  NotMeasurable = "not measurable",
  NotMet = "not met",
  Scripted = "scripted",
}
