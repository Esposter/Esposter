// A shield an enemy holds as an extra health bar, which a hit's damage takes before the enemy's health. Its break staggers
// The enemy, and it stands again at its maximum when that stagger ends or the enemy arrives home healed
export interface EnemyShield {
  health: number;
  maxHealth: number;
}
