import { GENSHIN_FIVE_STAR_COLOR, GENSHIN_FOUR_STAR_COLOR } from "@/services/agentConsole/constants";

// The star a session opens with takes its character's rarity: purple for four stars and gold for five
export const getStarColor = (rarity: number): string =>
  rarity === 5 ? GENSHIN_FIVE_STAR_COLOR : GENSHIN_FOUR_STAR_COLOR;
