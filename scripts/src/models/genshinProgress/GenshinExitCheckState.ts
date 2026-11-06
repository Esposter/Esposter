// Where an exit check stands: met when it was read and holds, not met with the items that fail it named, or not measurable
// when no command can read it
export enum GenshinExitCheckState {
  Met = "met",
  NotMeasurable = "not measurable",
  NotMet = "not met",
}
