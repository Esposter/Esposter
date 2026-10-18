export interface DomainChallengeEnemy {
  count: number;
  name: string;
}

export interface DomainChallengeLevel {
  // The defeats the level asks for within its time limit
  defeatTarget: number;
  timeLimitSeconds: number;
  // Each wave's enemy groups, the wave held as its groups' members
  waves: DomainChallengeEnemy[][];
}

// Each domain's challenge levels by its entry id, PROVISIONAL from the wiki's Domain page: its four targets are its four
// Levels in order, and each target's enemies are the wiki's waves, its `//` separating each wave and `;` each group.
// The domain's scene export gives its real waves, time limits and member spawns, which replace these
export const DOMAIN_CHALLENGE_LEVELS: Readonly<Record<number, readonly DomainChallengeLevel[]>> = {
  // Ridge Watch, the Blessing of the Ridge, from its wiki page
  13: [
    {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
          { count: 2, name: "Hilichurl Berserker" },
        ],
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 2, name: "Hilichurl Berserker" },
        ],
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
        ],
      ],
    },
    {
      defeatTarget: 8,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 4, name: "Hilichurl Berserker" },
          { count: 1, name: "Blazing Axe Mitachurl" },
          { count: 2, name: "Blazing Axe Mitachurl" },
          { count: 1, name: "Large Pyro Slime" },
        ],
      ],
    },
    {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Large Pyro Slime" },
          { count: 3, name: "Large Pyro Slime" },
          { count: 2, name: "Blazing Axe Mitachurl" },
          { count: 2, name: "Blazing Axe Mitachurl" },
          { count: 1, name: "Rock Shieldwall Mitachurl" },
        ],
      ],
    },
    {
      defeatTarget: 2,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Geovishap (Hydro)" },
          { count: 1, name: "Geovishap (Electro)" },
        ],
      ],
    },
  ],
};
