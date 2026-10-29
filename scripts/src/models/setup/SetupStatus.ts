// What a step found or did. `ok` was already in place, `done` the command did it now, `needs you` names the command or
// link that closes it, `install` is the game client alone, and `info` reports a state the command does not judge
export enum SetupStatus {
  Done = "done",
  Info = "info",
  Install = "install",
  NeedsYou = "needs you",
  Ok = "ok",
}
