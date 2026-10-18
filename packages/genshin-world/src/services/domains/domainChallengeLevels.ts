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

// Each domain's challenge levels by its entry id and then by the level's recommended rank, PROVISIONAL from the wiki's
// Domain Enemies table: the targets are the entry's tiers in ascending rank, and each target's enemies are its waves,
// With `//` between waves and `;` between groups. A tier with no wiki table has no entry here, so its level is Closed.
// The domain's scene export gives the real waves, time limits and member spawns, which replace these
export const DOMAIN_CHALLENGE_LEVELS: Readonly<Record<number, Readonly<Record<number, DomainChallengeLevel>>>> = {
  // Midsummer Courtyard, a Blessing domain from the wiki's Domain Enemies table
  1: {
    20: {
      defeatTarget: 26,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 5, name: "Cryo Slime" },
          { count: 1, name: "Large Cryo Slime" },
          { count: 2, name: "Hydro Slime" },
          { count: 2, name: "Large Hydro Slime" },
          { count: 15, name: "Wooden Shield Hilichurl Guard" },
          { count: 1, name: "Cryo Abyss Mage" },
        ],
      ],
    },
    25: {
      defeatTarget: 12,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 7, name: "Electro Slime" },
          { count: 1, name: "Large Electro Slime" },
          { count: 1, name: "Large Electro Slime" },
          { count: 2, name: "Mutant Electro Slime" },
          { count: 1, name: "Fatui Electro Cicin Mage" },
        ],
      ],
    },
    30: {
      defeatTarget: 14,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 9, name: "Cryo Slime" },
          { count: 4, name: "Large Cryo Slime" },
          { count: 1, name: "Cryo Abyss Mage" },
        ],
      ],
    },
    35: {
      defeatTarget: 15,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 8, name: "Hydro Slime" },
          { count: 4, name: "Large Hydro Slime" },
          { count: 1, name: "Large Hydro Slime" },
          { count: 1, name: "Hydro Abyss Mage" },
          { count: 1, name: "Hydro Samachurl" },
        ],
      ],
    },
    40: {
      defeatTarget: 5,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Large Cryo Slime" },
          { count: 1, name: "Large Cryo Slime" },
          { count: 1, name: "Cryo Abyss Mage" },
          { count: 1, name: "Cryo Abyss Mage" },
        ],
      ],
    },
    45: {
      defeatTarget: 7,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Large Electro Slime" },
          { count: 1, name: "Large Electro Slime" },
          { count: 2, name: "Mutant Electro Slime" },
        ],
        [
          { count: 1, name: "Fatui Electro Cicin Mage" },
          { count: 1, name: "Fatui Electro Cicin Mage" },
        ],
      ],
    },
  },
  // Cecilia Garden, a Forgery domain from the wiki's Domain Enemies table
  // Its levels with no total time limit on the wiki, the protect and between-kill ones, take 360 seconds, PROVISIONAL
  2: {
    15: {
      defeatTarget: 20,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 19, name: "Hydro Slime" },
          { count: 1, name: "Large Hydro Slime" },
        ],
      ],
    },
    21: {
      defeatTarget: 23,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 12, name: "Hydro Slime" },
          { count: 3, name: "Large Hydro Slime" },
          { count: 8, name: "Hilichurl Fighter" },
        ],
      ],
    },
    30: {
      defeatTarget: 22,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 13, name: "Hydro Slime" },
          { count: 6, name: "Large Hydro Slime" },
          { count: 3, name: "Hydro Samachurl" },
        ],
      ],
    },
    40: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [[{ count: 8, name: "Large Hydro Slime" }], [{ count: 2, name: "Fatui Pyro Agent" }]],
    },
  },
  // Hidden Palace of Lianshan Formula, a Forgery domain from the wiki's Domain Enemies table
  3: {
    15: {
      defeatTarget: 20,
      timeLimitSeconds: 360,
      waves: [
        [{ count: 15, name: "Electro Slime" }],
        [
          { count: 3, name: "Electro Slime" },
          { count: 1, name: "Large Electro Slime" },
          { count: 1, name: "Mutant Electro Slime" },
        ],
      ],
    },
    21: {
      defeatTarget: 16,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 7, name: "Electro Slime" },
          { count: 3, name: "Large Electro Slime" },
          { count: 3, name: "Mutant Electro Slime" },
        ],
        [
          { count: 2, name: "Large Electro Slime" },
          { count: 1, name: "Mutant Electro Slime" },
        ],
      ],
    },
    30: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 6, name: "Large Electro Slime" },
          { count: 3, name: "Mutant Electro Slime" },
        ],
        [{ count: 1, name: "Fatui Electro Cicin Mage" }],
      ],
    },
    40: {
      defeatTarget: 8,
      timeLimitSeconds: 480,
      waves: [
        [
          { count: 4, name: "Large Electro Slime" },
          { count: 2, name: "Mutant Electro Slime" },
          { count: 2, name: "Fatui Electro Cicin Mage" },
        ],
      ],
    },
  },
  // Valley of Remembrance, a Blessing domain from the wiki's Domain Enemies table
  6: {
    25: {
      defeatTarget: 23,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 10, name: "Treasure Hoarders: Cryo Potioneer" },
          { count: 5, name: "Treasure Hoarders: Handyman" },
          { count: 5, name: "Treasure Hoarders: Pugilist" },
          { count: 2, name: "Treasure Hoarders: Gravedigger" },
          { count: 1, name: "Treasure Hoarders: Seaman" },
        ],
      ],
    },
    30: {
      defeatTarget: 16,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 4, name: "Treasure Hoarders: Scout" },
          { count: 3, name: "Treasure Hoarders: Pyro Potioneer" },
          { count: 5, name: "Treasure Hoarders: Hydro Potioneer" },
          { count: 1, name: "Treasure Hoarders: Handyman" },
          { count: 1, name: "Treasure Hoarders: Crusher" },
          { count: 1, name: "Treasure Hoarders: Pugilist" },
          { count: 1, name: "Fatui Pyro Agent" },
        ],
      ],
    },
    35: {
      defeatTarget: 20,
      timeLimitSeconds: 60,
      waves: [
        [
          { count: 2, name: "Treasure Hoarders: Scout" },
          { count: 4, name: "Treasure Hoarders: Pyro Potioneer" },
          { count: 4, name: "Treasure Hoarders: Electro Potioneer" },
          { count: 4, name: "Treasure Hoarders: Handyman" },
          { count: 1, name: "Treasure Hoarders: Crusher" },
          { count: 2, name: "Treasure Hoarders: Pugilist" },
          { count: 1, name: "Treasure Hoarders: Gravedigger" },
          { count: 1, name: "Fatui Pyro Agent" },
          { count: 1, name: "Fatui Electro Cicin Mage" },
        ],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Treasure Hoarders: Pyro Potioneer" },
          { count: 1, name: "Treasure Hoarders: Hydro Potioneer" },
          { count: 1, name: "Treasure Hoarders: Electro Potioneer" },
          { count: 1, name: "Treasure Hoarders: Cryo Potioneer" },
          { count: 1, name: "Treasure Hoarders: Seaman" },
        ],
        [
          { count: 1, name: "Fatui Pyro Agent" },
          { count: 1, name: "Fatui Electro Cicin Mage" },
        ],
      ],
    },
    45: {
      defeatTarget: 5,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 3, name: "Treasure Hoarders: Cryo Potioneer" },
          { count: 1, name: "Fatui Pyro Agent" },
          { count: 1, name: "Fatui Electro Cicin Mage" },
        ],
      ],
    },
  },
  // Domain of Guyun, a Blessing domain from the wiki's Domain Enemies table
  // Its levels with no total time limit on the wiki, the protect and between-kill ones, take 360 seconds, PROVISIONAL
  7: {
    20: {
      defeatTarget: 28,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 21, name: "Hydro Slime" },
          { count: 1, name: "Large Hydro Slime" },
        ],
        [
          { count: 5, name: "Hydro Slime" },
          { count: 1, name: "Large Hydro Slime" },
        ],
      ],
    },
    25: {
      defeatTarget: 22,
      timeLimitSeconds: 360,
      waves: [
        [{ count: 5, name: "Pyro Slime" }],
        [{ count: 6, name: "Pyro Slime" }],
        [{ count: 2, name: "Large Pyro Slime" }],
        [
          { count: 2, name: "Large Pyro Slime" },
          { count: 4, name: "Pyro Slime" },
        ],
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 2, name: "Pyro Slime" },
        ],
      ],
    },
    30: {
      defeatTarget: 20,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 15, name: "Cryo Slime" },
          { count: 4, name: "Large Cryo Slime" },
          { count: 1, name: "Blazing Axe Mitachurl" },
        ],
      ],
    },
    35: {
      defeatTarget: 20,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 5, name: "Hydro Slime" },
          { count: 6, name: "Large Hydro Slime" },
          { count: 6, name: "Hilichurl Fighter" },
          { count: 2, name: "Hydro Samachurl" },
          { count: 1, name: "Hydro Abyss Mage" },
        ],
      ],
    },
    40: { defeatTarget: 1, timeLimitSeconds: 120, waves: [[{ count: 1, name: "Ruin Guard" }]] },
    45: {
      defeatTarget: 3,
      timeLimitSeconds: 420,
      waves: [
        [
          { count: 1, name: "Fatui Skirmisher - Hydrogunner Legionnaire" },
          { count: 1, name: "Fatui Skirmisher - Electrohammer Vanguard" },
        ],
        [{ count: 1, name: "Ruin Guard" }],
      ],
    },
  },
  // Hidden Palace of Zhou Formula, a Blessing domain from the wiki's Domain Enemies table
  // Its levels with no total time limit on the wiki, the protect and between-kill ones, take 360 seconds, PROVISIONAL
  8: {
    30: {
      defeatTarget: 20,
      timeLimitSeconds: 360,
      waves: [[{ count: 13, name: "Pyro Slime" }], [{ count: 7, name: "Large Pyro Slime" }]],
    },
    35: {
      defeatTarget: 6,
      timeLimitSeconds: 360,
      waves: [[{ count: 4, name: "Hilichurl Berserker" }], [{ count: 2, name: "Blazing Axe Mitachurl" }]],
    },
    40: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [{ count: 5, name: "Hilichurl Fighter" }],
        [
          { count: 2, name: "Hilichurl Fighter" },
          { count: 2, name: "Hilichurl Berserker" },
          { count: 1, name: "Blazing Axe Mitachurl" },
        ],
      ],
    },
    45: {
      defeatTarget: 4,
      timeLimitSeconds: 60,
      waves: [
        [{ count: 2, name: "Blazing Axe Mitachurl" }],
        [
          { count: 1, name: "Dendro Samachurl" },
          { count: 1, name: "Pyro Abyss Mage" },
        ],
      ],
    },
  },
  // Clear Pool and Mountain Cavern, a Blessing domain from the wiki's Domain Enemies table
  9: {
    35: {
      defeatTarget: 12,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 6, name: "Treasure Hoarders: Crusher" },
          { count: 6, name: "Treasure Hoarders: Pugilist" },
        ],
      ],
    },
    40: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 8, name: "Rock Shield Hilichurl Guard" },
          { count: 2, name: "Rock Shieldwall Mitachurl" },
        ],
      ],
    },
    45: { defeatTarget: 1, timeLimitSeconds: 360, waves: [[{ count: 1, name: "Ruin Guard" }]] },
  },
  // Forsaken Rift, a Mastery domain from the wiki's Domain Enemies table
  // Rank 45's wiki target is 8 but its listed enemies are 6, so its target is the enemies' count, PROVISIONAL
  10: {
    25: {
      defeatTarget: 18,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 15, name: "Cryo Slime" },
          { count: 3, name: "Large Cryo Slime" },
        ],
      ],
    },
    28: {
      defeatTarget: 20,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 7, name: "Hilichurl Fighter" },
          { count: 10, name: "Cryo Slime" },
          { count: 3, name: "Large Cryo Slime" },
        ],
      ],
    },
    36: {
      defeatTarget: 8,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 3, name: "Cryo Slime" },
          { count: 2, name: "Large Cryo Slime" },
        ],
        [{ count: 3, name: "Large Cryo Slime" }],
      ],
    },
    45: {
      defeatTarget: 6,
      timeLimitSeconds: 480,
      waves: [
        [{ count: 3, name: "Large Cryo Slime" }],
        [{ count: 2, name: "Large Cryo Slime" }],
        [{ count: 1, name: "Cryo Abyss Mage" }],
      ],
    },
  },
  // Taishan Mansion, a Mastery domain from the wiki's Domain Enemies table
  11: {
    25: {
      defeatTarget: 20,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 10, name: "Large Pyro Slime" },
          { count: 5, name: "Pyro Slime" },
        ],
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 4, name: "Pyro Slime" },
        ],
      ],
    },
    28: {
      defeatTarget: 12,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 3, name: "Large Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
          { count: 6, name: "Pyro Slime" },
        ],
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
        ],
      ],
    },
    36: {
      defeatTarget: 8,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 5, name: "Large Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
        ],
        [{ count: 2, name: "/Large Pyro Slime" }],
      ],
    },
    45: {
      defeatTarget: 4,
      timeLimitSeconds: 480,
      waves: [
        [{ count: 2, name: "Blazing Axe Mitachurl" }],
        [
          { count: 1, name: "Fatui Pyro Agent" },
          { count: 1, name: "Fatui Pyro Agent" },
        ],
      ],
    },
  },
  // Peak of Vindagnyr, a Blessing domain from the wiki's Domain Enemies table
  12: {
    30: {
      defeatTarget: 15,
      timeLimitSeconds: 600,
      waves: [
        [
          { count: 11, name: "Cryo Slime" },
          { count: 4, name: "Large Cryo Slime" },
        ],
      ],
    },
    35: {
      defeatTarget: 10,
      timeLimitSeconds: 600,
      waves: [
        [
          { count: 4, name: "Cryo Slime" },
          { count: 1, name: "Large Cryo Slime" },
          { count: 2, name: "Cryo Hilichurl Grenadier" },
          { count: 2, name: "Ice Shield Hilichurl Guard" },
        ],
        [{ count: 1, name: "Ice Shieldwall Mitachurl" }],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 600,
      waves: [
        [
          { count: 2, name: "Large Cryo Slime" },
          { count: 1, name: "Ice Shieldwall Mitachurl" },
          { count: 2, name: "Cryo Hilichurl Grenadier" },
        ],
        [{ count: 2, name: "Ice Shieldwall Mitachurl" }],
      ],
    },
    45: { defeatTarget: 1, timeLimitSeconds: 600, waves: [[{ count: 1, name: "Frostarm Lawachurl" }]] },
  },
  // Ridge Watch, a Blessing domain from the wiki's Domain Enemies table
  13: {
    30: {
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
    35: {
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
    40: {
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
    45: {
      defeatTarget: 2,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Geovishap (Hydro)" },
          { count: 1, name: "Geovishap (Electro)" },
        ],
      ],
    },
  },
  // Court of Flowing Sand, a Forgery domain from the wiki's Domain Enemies table
  14: {
    15: {
      defeatTarget: 18,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 10, name: "Hydro Slime" },
          { count: 1, name: "Large Hydro Slime" },
          { count: 5, name: "Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
        ],
      ],
    },
    21: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 4, name: "Large Hydro Slime" },
          { count: 1, name: "Large Hydro Slime" },
          { count: 4, name: "Large Pyro Slime" },
          { count: 1, name: "Large Pyro Slime" },
        ],
      ],
    },
    30: {
      defeatTarget: 8,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Large Hydro Slime" },
          { count: 1, name: "Large Hydro Slime" },
          { count: 3, name: "Large Pyro Slime" },
          { count: 1, name: "Hydro Abyss Mage" },
          { count: 1, name: "Pyro Abyss Mage" },
        ],
      ],
    },
    40: {
      defeatTarget: 12,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 5, name: "Large Electro Slime" },
          { count: 1, name: "Mutant Electro Slime" },
          { count: 3, name: "Electro Hilichurl Grenadier" },
        ],
        [
          { count: 1, name: "Crackling Axe Mitachurl" },
          { count: 2, name: "Crackling Axe Mitachurl" },
        ],
      ],
    },
  },
  // Violet Court, a Mastery domain from the wiki's Domain Enemies table
  15: {
    25: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 3, name: "Hilichurl" },
          { count: 3, name: "Electro Hilichurl Grenadier" },
        ],
        [
          { count: 3, name: "Electro Hilichurl Shooter" },
          { count: 1, name: "Crackling Axe Mitachurl" },
        ],
      ],
    },
    28: {
      defeatTarget: 8,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Nobushi: Jintouban" },
          { count: 1, name: "Treasure Hoarders: Pyro Potioneer" },
          { count: 2, name: "Treasure Hoarders: Electro Potioneer" },
        ],
        [
          { count: 1, name: "Nobushi: Hitsukeban" },
          { count: 2, name: "Nobushi: Kikouban" },
        ],
      ],
    },
    36: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Nobushi: Hitsukeban" },
          { count: 1, name: "Nobushi: Kikouban" },
          { count: 3, name: "Treasure Hoarders: Pyro Potioneer" },
        ],
        [
          { count: 3, name: "Treasure Hoarders: Electro Potioneer" },
          { count: 1, name: "Kairagi: Fiery Might" },
        ],
      ],
    },
    45: {
      defeatTarget: 8,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 6, name: "Treasure Hoarders: Cryo Potioneer" },
          { count: 1, name: "Kairagi: Fiery Might" },
          { count: 1, name: "Kairagi: Dancing Thunder" },
        ],
      ],
    },
  },
  // Momiji-Dyed Court, a Blessing domain from the wiki's Domain Enemies table
  16: {
    30: {
      defeatTarget: 13,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 3, name: "Electro Hilichurl Grenadier" },
          { count: 3, name: "Hilichurl Berserker" },
        ],
        [
          { count: 3, name: "Electro Slime" },
          { count: 3, name: "Electro Hilichurl Shooter" },
          { count: 1, name: "Crackling Axe Mitachurl" },
        ],
      ],
    },
    35: {
      defeatTarget: 9,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 3, name: "Large Electro Slime" },
          { count: 3, name: "Electro Hilichurl Shooter" },
        ],
        [
          { count: 1, name: "Large Electro Slime" },
          { count: 1, name: "Mutant Electro Slime" },
          { count: 1, name: "Crackling Axe Mitachurl" },
        ],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 4, name: "Large Electro Slime" },
          { count: 1, name: "Mutant Electro Slime" },
        ],
        [{ count: 2, name: "Electro Abyss Mage" }],
      ],
    },
    45: {
      defeatTarget: 4,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Large Electro Slime" },
          { count: 1, name: "Thunderhelm Lawachurl" },
          { count: 1, name: "Electro Abyss Mage" },
        ],
      ],
    },
  },
  // Slumbering Court, a Blessing domain from the wiki's Domain Enemies table
  17: {
    30: {
      defeatTarget: 10,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Crackling Axe Mitachurl" },
          { count: 2, name: "Large Hydro Slime" },
          { count: 7, name: "Hydro Slime" },
        ],
      ],
    },
    35: {
      defeatTarget: 13,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Crackling Axe Mitachurl" },
          { count: 2, name: "Large Hydro Slime" },
          { count: 3, name: "Hydro Slime" },
          { count: 3, name: "Electro Hilichurl Shooter" },
          { count: 3, name: "Hilichurl Berserker" },
        ],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 360,
      waves: [
        [{ count: 4, name: "Thundercraven Rifthound Whelp" }],
        [
          { count: 1, name: "Thundercraven Rifthound" },
          { count: 2, name: "Electro Hilichurl Shooter" },
        ],
      ],
    },
    45: {
      defeatTarget: 9,
      timeLimitSeconds: 360,
      waves: [
        [{ count: 5, name: "Thundercraven Rifthound Whelp" }],
        [
          { count: 2, name: "Thundercraven Rifthound Whelp" },
          { count: 1, name: "Thundercraven Rifthound" },
          { count: 1, name: "Crackling Axe Mitachurl" },
        ],
      ],
    },
  },
  // The Lost Valley, a Blessing domain from the wiki's Domain Enemies table
  18: {
    30: {
      defeatTarget: 2,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Ruin Guard" },
          { count: 1, name: "Ruin Destroyer" },
        ],
      ],
    },
    35: {
      defeatTarget: 4,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Ruin Guard" },
          { count: 1, name: "Ruin Scout" },
          { count: 1, name: "Ruin Cruiser" },
          { count: 1, name: "Ruin Destroyer" },
        ],
      ],
    },
    40: {
      defeatTarget: 5,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Ruin Scout" },
          { count: 2, name: "Ruin Cruiser" },
          { count: 2, name: "Ruin Destroyer" },
        ],
      ],
    },
    45: {
      defeatTarget: 3,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Ruin Grader" },
          { count: 1, name: "Ruin Cruiser" },
          { count: 1, name: "Ruin Destroyer" },
        ],
      ],
    },
  },
  // Steeple of Ignorance, a Mastery domain from the wiki's Domain Enemies table
  19: {
    25: {
      defeatTarget: 2,
      timeLimitSeconds: 300,
      waves: [[{ count: 1, name: "Ruin Guard" }], [{ count: 1, name: "Ruin Drake: Earthguard" }]],
    },
    28: {
      defeatTarget: 3,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Ruin Destroyer" },
          { count: 1, name: "Ruin Scout" },
        ],
        [{ count: 1, name: "Ruin Drake: Earthguard" }],
      ],
    },
    36: {
      defeatTarget: 2,
      timeLimitSeconds: 300,
      waves: [[{ count: 1, name: "Ruin Drake: Earthguard" }], [{ count: 1, name: "Ruin Drake: Skywatch" }]],
    },
    45: {
      defeatTarget: 2,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Ruin Drake: Earthguard" },
          { count: 1, name: "Ruin Drake: Skywatch" },
        ],
      ],
    },
  },
  // Spire of Solitary Enlightenment, a Blessing domain from the wiki's Domain Enemies table
  20: {
    30: {
      defeatTarget: 8,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Eremite Crossbow" },
          { count: 2, name: "Eremite Sword-Dancer" },
          { count: 1, name: "Eremite Ravenbeak Halberdier" },
        ],
        [{ count: 3, name: "Eremite Crossbow" }],
        [{ count: 1, name: "Eremite Sunfrost" }],
      ],
    },
    35: {
      defeatTarget: 11,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 2, name: "Eremite Crossbow" },
          { count: 2, name: "Eremite Sword-Dancer" },
          { count: 1, name: "Eremite Axe Vanguard" },
        ],
        [
          { count: 2, name: "Eremite Crossbow" },
          { count: 1, name: "Eremite Daythunder" },
        ],
        [
          { count: 1, name: "Eremite Sword-Dancer" },
          { count: 1, name: "Eremite Axe Vanguard" },
          { count: 1, name: "Eremite Desert Clearwater" },
        ],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Eremite Daythunder" },
          { count: 2, name: "Eremite Crossbow" },
          { count: 1, name: "Eremite Linebreaker" },
          { count: 1, name: "Eremite Ravenbeak Halberdier" },
        ],
        [
          { count: 1, name: "Eremite Desert Clearwater" },
          { count: 1, name: "Eremite Sunfrost" },
        ],
      ],
    },
    45: {
      defeatTarget: 3,
      timeLimitSeconds: 360,
      waves: [
        [
          { count: 1, name: "Eremite Daythunder" },
          { count: 1, name: "Eremite Desert Clearwater" },
          { count: 1, name: "Eremite Sunfrost" },
        ],
      ],
    },
  },
  // Tower of Abject Pride, a Forgery domain from the wiki's Domain Enemies table
  21: {
    15: {
      defeatTarget: 12,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Stretchy Pyro Fungus" },
          { count: 6, name: "Floating Dendro Fungus" },
          { count: 2, name: "Floating Hydro Fungus" },
          { count: 2, name: "Whirling Electro Fungus" },
        ],
      ],
    },
    21: {
      defeatTarget: 16,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 4, name: "Whirling Cryo Fungus" },
          { count: 4, name: "Stretchy Pyro Fungus" },
          { count: 4, name: "Stretchy Geo Fungus" },
          { count: 2, name: "Floating Dendro Fungus" },
          { count: 2, name: "Whirling Electro Fungus" },
        ],
      ],
    },
    30: {
      defeatTarget: 10,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Stretchy Pyro Fungus" },
          { count: 2, name: "Whirling Cryo Fungus" },
        ],
        [
          { count: 2, name: "Stretchy Geo Fungus" },
          { count: 1, name: "Whirling Electro Fungus" },
          { count: 1, name: "Floating Dendro Fungus" },
        ],
        [
          { count: 1, name: "Grounded Hydroshroom" },
          { count: 1, name: "Winged Dendroshroom" },
        ],
      ],
    },
    40: {
      defeatTarget: 9,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Floating Hydro Fungus" },
          { count: 2, name: "Floating Dendro Fungus" },
          { count: 1, name: "Grounded Hydroshroom" },
        ],
        [
          { count: 1, name: "Floating Hydro Fungus" },
          { count: 1, name: "Floating Dendro Fungus" },
          { count: 1, name: "Grounded Hydroshroom" },
          { count: 1, name: "Winged Dendroshroom" },
        ],
      ],
    },
  },
  // City of Gold, a Blessing domain from the wiki's Domain Enemies table
  22: {
    30: {
      defeatTarget: 12,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 3, name: "Hydro Slime" },
          { count: 2, name: "Pyro Slime" },
          { count: 2, name: "Stretchy Pyro Fungus" },
          { count: 4, name: "Cryo Slime" },
          { count: 1, name: "Large Electro Slime" },
        ],
      ],
    },
    35: {
      defeatTarget: 12,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 4, name: "Cryo Slime" },
          { count: 4, name: "Pyro Slime" },
          { count: 2, name: "Whirling Electro Fungus" },
          { count: 1, name: "Winged Cryoshroom" },
        ],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Grounded Geoshroom" },
          { count: 2, name: "Large Pyro Slime" },
          { count: 2, name: "Large Hydro Slime" },
          { count: 1, name: "Grounded Hydroshroom" },
        ],
      ],
    },
    45: {
      defeatTarget: 8,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Large Pyro Slime" },
          { count: 2, name: "Grounded Hydroshroom" },
          { count: 2, name: "Large Hydro Slime" },
          { count: 1, name: "Grounded Geoshroom" },
          { count: 1, name: "Winged Cryoshroom" },
        ],
      ],
    },
  },
  // Molten Iron Fortress, a Blessing domain from the wiki's Domain Enemies table
  23: {
    30: {
      defeatTarget: 12,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 6, name: "Hilichurl" },
          { count: 4, name: "Hilichurl Fighter" },
          { count: 1, name: "Hydro Samachurl" },
          { count: 1, name: "Blazing Axe Mitachurl" },
        ],
      ],
    },
    35: {
      defeatTarget: 9,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 3, name: "Hilichurl" },
          { count: 2, name: "Hilichurl Fighter" },
          { count: 1, name: "Hydro Samachurl" },
          { count: 2, name: "Hilichurl Grenadier" },
          { count: 1, name: "Anemo Hilichurl Rogue" },
        ],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 3, name: "Hilichurl Fighter" },
          { count: 1, name: "Blazing Axe Mitachurl" },
        ],
        [
          { count: 2, name: "Blazing Axe Mitachurl" },
          { count: 1, name: "Hydro Hilichurl Rogue" },
        ],
      ],
    },
    45: {
      defeatTarget: 4,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 2, name: "Blazing Axe Mitachurl" }],
        [
          { count: 1, name: "Anemo Hilichurl Rogue" },
          { count: 1, name: "Hydro Hilichurl Rogue" },
        ],
      ],
    },
  },
  // Pale Forgotten Glory, a Mastery domain from the wiki's Domain Enemies table
  24: {
    25: {
      defeatTarget: 3,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 2, name: "Shatterstone Breacher Primus" }],
        [{ count: 1, name: "Large Shatterstone Breacher Primus" }],
      ],
    },
    28: {
      defeatTarget: 4,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 3, name: "Overgrown Breacher Primus" }],
        [{ count: 1, name: "Large Overgrown Breacher Primus" }],
      ],
    },
    36: { defeatTarget: 2, timeLimitSeconds: 300, waves: [[{ count: 2, name: "Large Shatterstone Breacher Primus" }]] },
    45: { defeatTarget: 2, timeLimitSeconds: 300, waves: [[{ count: 2, name: "Large Overgrown Breacher Primus" }]] },
  },
  // Echoes of the Deep Tides, a Forgery domain from the wiki's Domain Enemies table
  25: {
    15: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Treasure Hoarders: Scout" },
          { count: 1, name: "Recon Log Mek - Pneuma" },
        ],
        [
          { count: 1, name: "Treasure Hoarders: Hydro Potioneer" },
          { count: 2, name: "Recon Log Mek - Pneuma" },
        ],
      ],
    },
    21: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Treasure Hoarders: Scout" },
          { count: 2, name: "Geological Survey Mek - Pneuma" },
        ],
        [
          { count: 2, name: "Treasure Hoarders: Hydro Potioneer" },
          { count: 1, name: "Construction Specialist Mek - Pneuma" },
        ],
      ],
    },
    30: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Fatui Pyro Agent" },
          { count: 2, name: "Recon Log Mek - Pneuma" },
        ],
        [
          { count: 1, name: "Fatui Electro Cicin Mage" },
          { count: 1, name: "Assault Specialist Mek - Pneuma" },
        ],
      ],
    },
    40: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Treasure Hoarders: Hydro Potioneer" },
          { count: 1, name: "Assault Specialist Mek - Pneuma" },
        ],
        [
          { count: 1, name: "Fatui Pyro Agent" },
          { count: 1, name: "Annihilation Specialist Mek - Pneuma" },
        ],
      ],
    },
  },
  // Denouement of Sin, a Blessing domain from the wiki's Domain Enemies table
  26: {
    30: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 2, name: "Recon Log Mek - Ousia" }],
        [
          { count: 2, name: "Recon Log Mek - Ousia" },
          { count: 1, name: "Arithmetic Enhancer Mek - Ousia" },
        ],
      ],
    },
    35: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Recon Log Mek - Ousia" },
          { count: 1, name: "Arithmetic Enhancer Mek - Ousia" },
        ],
        [
          { count: 2, name: "Recon Log Mek - Ousia" },
          { count: 1, name: "Suppression Specialist Mek - Ousia" },
        ],
      ],
    },
    40: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Construction Specialist Mek - Ousia" },
          { count: 2, name: "Geological Survey Mek - Ousia" },
        ],
        [
          { count: 1, name: "Arithmetic Enhancer Mek - Ousia" },
          { count: 1, name: "Suppression Specialist Mek - Ousia" },
          { count: 1, name: "Recon Log Mek - Ousia" },
        ],
      ],
    },
    45: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Geological Survey Mek - Ousia" },
          { count: 1, name: "Construction Specialist Mek - Ousia" },
        ],
        [
          { count: 1, name: "Suppression Specialist Mek - Ousia" },
          { count: 1, name: "Annihilation Specialist Mek - Ousia" },
        ],
      ],
    },
  },
  // Waterfall Wen, a Blessing domain from the wiki's Domain Enemies table
  27: {
    30: {
      defeatTarget: 15,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Hydro Slime" },
          { count: 4, name: "Pyro Slime" },
          { count: 4, name: "Electro Slime" },
          { count: 2, name: "Cryo Slime" },
        ],
        [
          { count: 1, name: "Hydro Slime" },
          { count: 1, name: "Electro Slime" },
          { count: 1, name: "Sternshield Crab" },
        ],
      ],
    },
    35: {
      defeatTarget: 15,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Hydro Slime" },
          { count: 2, name: "Large Hydro Slime" },
          { count: 2, name: "Pyro Slime" },
          { count: 2, name: "Large Pyro Slime" },
          { count: 4, name: "Electro Slime" },
        ],
        [
          { count: 2, name: "Large Hydro Slime" },
          { count: 1, name: "Bubbler Seahorse" },
        ],
      ],
    },
    40: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 1, name: "Large Electro Slime" },
          { count: 1, name: "Large Cryo Slime" },
        ],
        [
          { count: 1, name: "Large Electro Slime" },
          { count: 1, name: "Large Cryo Slime" },
          { count: 1, name: "Cherubic Sea Hare" },
        ],
      ],
    },
    45: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Large Pyro Slime" },
          { count: 1, name: "Large Electro Slime" },
          { count: 1, name: "Large Cryo Slime" },
          { count: 1, name: "Sternshield Crab" },
        ],
        [
          { count: 1, name: "Cherubic Sea Hare" },
          { count: 1, name: "Bubbler Seahorse" },
        ],
      ],
    },
  },
  // Faded Theater, a Blessing domain from the wiki's Domain Enemies table
  28: {
    30: {
      defeatTarget: 15,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 4, name: "Hydro Slime" },
          { count: 4, name: "Cryo Slime" },
          { count: 4, name: "Rock Shield Hilichurl Guard" },
        ],
        [
          { count: 1, name: "Rock Shieldwall Mitachurl" },
          { count: 2, name: "Rock Shield Hilichurl Guard" },
        ],
      ],
    },
    35: {
      defeatTarget: 10,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 4, name: "Rock Shield Hilichurl Guard" },
          { count: 2, name: "Pyro Hilichurl Shooter" },
        ],
        [
          { count: 2, name: "Rock Shieldwall Mitachurl" },
          { count: 2, name: "Pyro Hilichurl Shooter" },
        ],
      ],
    },
    40: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 1, name: "Praetorian Golem" }],
        [
          { count: 1, name: "Praetorian Golem" },
          { count: 1, name: "Large Electro Slime" },
          { count: 2, name: "Large Cryo Slime" },
        ],
      ],
    },
    45: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [[{ count: 2, name: "Rock Shieldwall Mitachurl" }], [{ count: 3, name: "Praetorian Golem" }]],
    },
  },
  // Blazing Ruins, a Mastery domain from the wiki's Domain Enemies table
  29: {
    25: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 4, name: "Tepetlisaur Whelp" }],
        [
          { count: 1, name: "Tepetlisaurus" },
          { count: 2, name: "Tepetlisaur Whelp" },
        ],
      ],
    },
    28: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Forged Sand Interrogator" },
          { count: 2, name: "Forged Sand Shieldbreaker" },
        ],
        [
          { count: 1, name: "Tepetlisaurus Warrior: Shard Striker" },
          { count: 2, name: "Forged Sand Javelineer" },
        ],
      ],
    },
    36: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Forged Sand Interrogator" },
          { count: 2, name: "Tepetlisaur Whelp" },
        ],
        [
          { count: 1, name: "Tepetlisaurus Warrior: Rockbreaker Blade" },
          { count: 2, name: "Tepetlisaurus" },
        ],
      ],
    },
    45: { defeatTarget: 2, timeLimitSeconds: 300, waves: [[{ count: 2, name: "Fluid Avatar of Lava" }]] },
  },
  // Ancient Watchtower, a Forgery domain from the wiki's Domain Enemies table
  30: {
    15: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 4, name: "Yumkasaur Whelp" }],
        [
          { count: 1, name: "Yumkasaurus" },
          { count: 2, name: "Yumkasaur Whelp" },
        ],
      ],
    },
    21: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Swiftstep Seeker" },
          { count: 2, name: "Swiftstep Armed Courier" },
        ],
        [
          { count: 1, name: "Yumkasaurus Warrior: Whirling Leaves" },
          { count: 2, name: "Swiftstep Storm Scout" },
        ],
      ],
    },
    30: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Swiftstep Seeker" },
          { count: 2, name: "Yumkasaur Whelp" },
        ],
        [
          { count: 1, name: "Yumkasaurus Warrior: Flowing Skyfire" },
          { count: 2, name: "Yumkasaurus" },
        ],
      ],
    },
    40: {
      defeatTarget: 1,
      timeLimitSeconds: 300,
      waves: [[{ count: 1, name: "Secret Source Automaton: Hunter-Seeker" }]],
    },
  },
  // Sanctum of Rainbow Spirits, a Blessing domain from the wiki's Domain Enemies table
  31: {
    30: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 4, name: "Koholasaur Whelp" }],
        [
          { count: 1, name: "Koholasaurus" },
          { count: 2, name: "Koholasaur Whelp" },
        ],
      ],
    },
    35: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Flowing Blade Grease-Saw" },
          { count: 2, name: "Flowing Blade Skirmisher" },
        ],
        [
          { count: 1, name: "Koholasaurus Warrior: Waveshuttler" },
          { count: 2, name: "Flowing Blade Harpoon-Thrower" },
        ],
      ],
    },
    40: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Flowing Blade Skirmisher" },
          { count: 2, name: "Koholasaur Whelp" },
        ],
        [
          { count: 1, name: "Koholasaurus Warrior: Reefsplitter" },
          { count: 2, name: "Koholasaurus" },
        ],
      ],
    },
    45: { defeatTarget: 3, timeLimitSeconds: 300, waves: [[{ count: 3, name: "Eroding Avatar of Lava" }]] },
  },
  // Derelict Masonry Dock, a Blessing domain from the wiki's Domain Enemies table
  32: {
    30: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [{ count: 3, name: "Tatankasaur Whelp" }],
        [
          { count: 2, name: "Tatankasaur Whelp" },
          { count: 1, name: "Tatankasaurus" },
        ],
      ],
    },
    35: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Ferocious Warrior: Human Ram" },
          { count: 1, name: "Ferocious Warrior: Wrestler" },
        ],
        [
          { count: 2, name: "Ferocious Warrior: Grappler" },
          { count: 1, name: "Tatankasaurus Warrior: Skybreaker" },
        ],
      ],
    },
    40: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Ferocious Warrior: Human Ram" },
          { count: 1, name: "Tatankasaurus Warrior: Skybreaker" },
        ],
        [
          { count: 2, name: "Tatankasaurus Warrior: Spiritlight Chaser" },
          { count: 1, name: "Tatankasaurus Warrior: Skybreaker" },
        ],
      ],
    },
    45: { defeatTarget: 1, timeLimitSeconds: 300, waves: [[{ count: 1, name: "Furnace Shell Mountain Weasel" }]] },
  },
  // Lightless Capital, a Mastery domain from the wiki's Domain Enemies table
  33: {
    25: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Line Trooper" },
          { count: 2, name: "Oprichniki Vanguard" },
        ],
        [
          { count: 2, name: "Oprichniki Vanguard" },
          { count: 1, name: "Oprichniki Fireblade Shock Trooper" },
        ],
      ],
    },
    28: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Line Trooper" },
          { count: 2, name: "Oprichniki Vanguard" },
        ],
        [
          { count: 2, name: "Oprichniki Vanguard" },
          { count: 1, name: "Oprichniki Fireblade Shock Trooper" },
        ],
      ],
    },
    36: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Line Trooper" },
          { count: 2, name: "Oprichniki Vanguard" },
        ],
        [
          { count: 2, name: "Oprichniki Vanguard" },
          { count: 1, name: "Oprichniki Fireblade Shock Trooper" },
        ],
      ],
    },
    45: {
      defeatTarget: 3,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Cutting Edge Fire Support Ground Effect Landcruiser" },
          { count: 2, name: "Oprichniki Hailstorm Cannoneer" },
        ],
      ],
    },
  },
  // Lost Mooncourt, a Forgery domain from the wiki's Domain Enemies table
  34: {
    15: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Line Trooper" },
          { count: 2, name: "Oprichniki Medic" },
        ],
        [
          { count: 1, name: "Oprichniki Thunderblitz Gvardiya" },
          { count: 2, name: "Oprichniki Medic" },
        ],
      ],
    },
    21: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Line Trooper" },
          { count: 2, name: "Oprichniki Medic" },
        ],
        [
          { count: 1, name: "Oprichniki Thunderblitz Gvardiya" },
          { count: 2, name: "Oprichniki Medic" },
        ],
      ],
    },
    30: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Line Trooper" },
          { count: 2, name: "Oprichniki Medic" },
        ],
        [
          { count: 1, name: "Oprichniki Thunderblitz Gvardiya" },
          { count: 2, name: "Oprichniki Medic" },
        ],
      ],
    },
    40: {
      defeatTarget: 2,
      timeLimitSeconds: 300,
      waves: [[{ count: 2, name: "Cutting Edge All-Purpose Storm Landcruiser" }]],
    },
  },
  // Frostladen Machinery, a Blessing domain from the wiki's Domain Enemies table
  35: {
    30: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Bombardier" },
          { count: 2, name: "Oprichniki Medic" },
        ],
        [
          { count: 2, name: "Oprichniki Grenadier" },
          { count: 1, name: "Cutting Edge All-Purpose Scout Landcruiser" },
        ],
      ],
    },
    35: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Bombardier" },
          { count: 2, name: "Oprichniki Medic" },
        ],
        [
          { count: 2, name: "Oprichniki Grenadier" },
          { count: 1, name: "Cutting Edge All-Purpose Scout Landcruiser" },
        ],
      ],
    },
    40: { defeatTarget: 2, timeLimitSeconds: 300, waves: [[{ count: 2, name: "Wilderness Exile" }]] },
    45: { defeatTarget: 1, timeLimitSeconds: 300, waves: [[{ count: 1, name: "Wilderness Hunter" }]] },
  },
  // Moonchild's Treasures, a Blessing domain from the wiki's Domain Enemies table
  36: {
    30: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Vanguard" },
          { count: 2, name: "Force Recon Storm Landcruiser" },
        ],
        [
          { count: 1, name: "Oprichniki Fireblade Shock Trooper" },
          { count: 2, name: "Force Recon Ground Effect Landcruiser" },
        ],
      ],
    },
    35: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Vanguard" },
          { count: 2, name: "Force Recon Storm Landcruiser" },
        ],
        [
          { count: 1, name: "Oprichniki Fireblade Shock Trooper" },
          { count: 2, name: "Force Recon Ground Effect Landcruiser" },
        ],
      ],
    },
    40: {
      defeatTarget: 7,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Oprichniki Vanguard" },
          { count: 2, name: "Force Recon Storm Landcruiser" },
        ],
        [
          { count: 1, name: "Oprichniki Fireblade Shock Trooper" },
          { count: 2, name: "Force Recon Ground Effect Landcruiser" },
        ],
      ],
    },
    45: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [[{ count: 3, name: "Fisher of Hidden Depths" }], [{ count: 3, name: "Fisher of Hidden Depths" }]],
    },
  },
  // Thorny Crown of the Mountain Wind, a Blessing domain from the wiki's Domain Enemies table
  37: {
    30: {
      defeatTarget: 3,
      timeLimitSeconds: 300,
      waves: [[{ count: 2, name: "Blazing Axe Mitachurl" }], [{ count: 1, name: "Hydro Hilichurl Rogue" }]],
    },
    35: { defeatTarget: 1, timeLimitSeconds: 300, waves: [[{ count: 1, name: "Stonehide Lawachurl" }]] },
    40: { defeatTarget: 1, timeLimitSeconds: 300, waves: [[{ count: 1, name: "Ruin Drake: Earthguard" }]] },
    45: { defeatTarget: 2, timeLimitSeconds: 300, waves: [[{ count: 2, name: "Domain Keeper" }]] },
  },
  // Relics of the Fallen Grace, a Mastery domain from the wiki's Domain Enemies table
  38: {
    25: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Volkodlak Raider" },
          { count: 1, name: "Volkodlak Sharpshooter" },
        ],
        [
          { count: 2, name: "Volkodlak Sharpshooter" },
          { count: 1, name: "Volkodlak Lobber" },
        ],
      ],
    },
    28: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [[{ count: 3, name: "Winged Soarer Knight" }], [{ count: 2, name: "Winged Halberd-Knight" }]],
    },
    36: { defeatTarget: 9, timeLimitSeconds: 300, waves: [[{ count: 9, name: "Juvenile Tree Segment" }]] },
    45: {
      defeatTarget: 6,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Rugged Elder Leshy" },
          { count: 2, name: "Juvenile Tree Segment" },
        ],
        [
          { count: 1, name: "Rugged Elder Leshy" },
          { count: 2, name: "Juvenile Tree Segment" },
        ],
      ],
    },
  },
  // Scars of Cursed Obsession, a Forgery domain from the wiki's Domain Enemies table
  39: {
    15: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Volkodlak Raider" },
          { count: 1, name: "Volkodlak Sharpshooter" },
        ],
        [{ count: 2, name: "Volkodlak Lobber" }],
      ],
    },
    21: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 2, name: "Volkodlak Raider" },
          { count: 1, name: "Volkodlak Sharpshooter" },
        ],
        [{ count: 2, name: "Volkodlak Basher" }],
      ],
    },
    30: {
      defeatTarget: 4,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Long-Eared Striker" },
          { count: 1, name: "Leomastiff Guard" },
        ],
        [
          { count: 1, name: "Channel Contact" },
          { count: 1, name: "Voywolf Hunter" },
        ],
      ],
    },
    40: {
      defeatTarget: 2,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Voywolf Hunter" },
          { count: 1, name: "Fanged Zealot" },
        ],
      ],
    },
  },
  // Inverted Glacier, a Blessing domain from the wiki's Domain Enemies table
  // Rank 40's wiki target is 7 but its listed enemies are 3, so its target is the enemies' count, PROVISIONAL
  40: {
    30: {
      defeatTarget: 4,
      timeLimitSeconds: 300,
      waves: [[{ count: 2, name: "Volkodlak Basher" }], [{ count: 2, name: "Volkodlak Basher" }]],
    },
    35: {
      defeatTarget: 5,
      timeLimitSeconds: 300,
      waves: [[{ count: 3, name: "Glaciomancer" }], [{ count: 2, name: "Chimeric Winged Elephant" }]],
    },
    40: {
      defeatTarget: 3,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Chimeric Burrowbeast" },
          { count: 1, name: "Chimeric Armored Beast" },
        ],
        [{ count: 1, name: "Chimeric Horned Bear" }],
      ],
    },
    45: {
      defeatTarget: 4,
      timeLimitSeconds: 300,
      waves: [
        [
          { count: 1, name: "Glacial Warden" },
          { count: 1, name: "Glaciomancer" },
        ],
        [
          { count: 1, name: "Chimeric Horned Bear" },
          { count: 1, name: "Chimeric Armored Beast" },
        ],
      ],
    },
  },
};
