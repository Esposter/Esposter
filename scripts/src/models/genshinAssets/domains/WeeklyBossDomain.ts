// One level of a weekly boss's trounce domain: its boss dungeon, the enemies' level it fights at and the recommended Adventure
// Rank it is set at
export interface WeeklyBossLevel {
  dungeonId: number;
  enemyLevel: number;
  recommendedRank: number;
}

// A weekly boss's trounce domain by its entrance's entry id, its levels lowest dungeon first
export interface WeeklyBossDomain {
  levels: WeeklyBossLevel[];
}
