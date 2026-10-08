// What the body is doing, which decides how it moves and what it spends: the game's movement states, a dash, a climb's
// Jump and a swim's dash among them since each moves and costs apart from the state it starts from
export enum LocomotionState {
  Climb = "Climb",
  ClimbJump = "ClimbJump",
  Dash = "Dash",
  Drown = "Drown",
  Fall = "Fall",
  Glide = "Glide",
  Idle = "Idle",
  Jump = "Jump",
  Plunge = "Plunge",
  Run = "Run",
  Sprint = "Sprint",
  Swim = "Swim",
  SwimDash = "SwimDash",
  Walk = "Walk",
}
