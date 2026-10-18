import type { EnemyWeakPoint } from "#src/models/enemy/EnemyWeakPoint";

import { EnemyFamily } from "#src/models/enemy/EnemyFamily";

const WIKI_PAGE_BASE = "https://genshin-impact.fandom.com/wiki/";
// The weak points the wiki states for the Ruin machines, the Automatons family, each part cited to the page of its kind. The
// Game's kind ids here name only Ruin Drake, so the map is keyed by family; exposure conditions per kind are not modelled
export const ENEMY_FAMILY_WEAK_POINTS: Partial<Record<EnemyFamily, readonly EnemyWeakPoint[]>> = {
  [EnemyFamily.Automatons]: [
    { kind: "Ruin Guard", part: "glowing eye", source: `${WIKI_PAGE_BASE}Ruin_Guard` },
    { kind: "Ruin Guard", part: "socket on its back", source: `${WIKI_PAGE_BASE}Ruin_Guard` },
    { kind: "Ruin Hunter", part: "glowing eye, exposed only when airborne", source: `${WIKI_PAGE_BASE}Ruin_Hunter` },
    { kind: "Ruin Scout", part: "core, exposed during its headbutt", source: `${WIKI_PAGE_BASE}Ruin_Scout` },
    { kind: "Ruin Sentinel", part: "core, exposed during certain attacks", source: `${WIKI_PAGE_BASE}Ruin_Sentinel` },
    {
      kind: "Ruin Grader",
      part: "core in its head, exposed during certain attacks",
      source: `${WIKI_PAGE_BASE}Ruin_Grader`,
    },
    {
      kind: "Ruin Grader",
      part: "cores in both feet, exposed during certain attacks",
      source: `${WIKI_PAGE_BASE}Ruin_Grader`,
    },
    { kind: "Ruin Grader", part: "eye, exposed during certain attacks", source: `${WIKI_PAGE_BASE}Ruin_Grader` },
    { kind: "Ruin Drake", part: "weak spots, exposed during specific attacks", source: `${WIKI_PAGE_BASE}Ruin_Drake` },
  ],
};
