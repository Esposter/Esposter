// Where an enemy stands in its AI: idle at home or walking its patrol, alert to a target, chasing it, winding up and
// Recovering from an attack, staggered, walking home, or dead
export enum EnemyState {
  Alert = "Alert",
  Chase = "Chase",
  Dead = "Dead",
  Idle = "Idle",
  Recovery = "Recovery",
  Return = "Return",
  Stagger = "Stagger",
  Windup = "Windup",
}
