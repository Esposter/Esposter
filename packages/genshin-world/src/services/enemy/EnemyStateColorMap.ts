import { EnemyState } from "#src/models/enemy/EnemyState";

// The tint an enemy's stand-in capsule takes in each state, so its AI can be watched until its model is drawn
export const EnemyStateColorMap: Record<EnemyState, string> = {
  [EnemyState.Alert]: "#e8c547",
  [EnemyState.Chase]: "#e8893a",
  [EnemyState.Dead]: "#4a4a4a",
  [EnemyState.Idle]: "#9aa39a",
  [EnemyState.Recovery]: "#b0613a",
  [EnemyState.Return]: "#5b8fd9",
  [EnemyState.Stagger]: "#c46be0",
  [EnemyState.Windup]: "#d93c3c",
};
