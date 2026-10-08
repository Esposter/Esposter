import { EnemyState } from "#src/models/enemy/EnemyState";

// The tint an enemy's stand-in capsule takes in each state, so its AI can be watched until its model is drawn
export const EnemyStateColorMap: Record<EnemyState, number> = {
  [EnemyState.Alert]: 0xe8_c5_47,
  [EnemyState.Chase]: 0xe8_89_3a,
  [EnemyState.Dead]: 0x4a_4a_4a,
  [EnemyState.Idle]: 0x9a_a3_9a,
  [EnemyState.Recovery]: 0xb0_61_3a,
  [EnemyState.Return]: 0x5b_8f_d9,
  [EnemyState.Stagger]: 0xc4_6b_e0,
  [EnemyState.Windup]: 0xd9_3c_3c,
};
