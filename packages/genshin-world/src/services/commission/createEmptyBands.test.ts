import type { RewardItem } from "#src/models/reward/RewardItem";

import { COMMISSION_RANK_BAND_COUNT } from "#src/services/commission/constants";
import { describe } from "vitest";

// A slice's rank bands, each holding no reward, as the commission suites hold them where a rank pays nothing
export const createEmptyBands = (): RewardItem[][] =>
  Array.from({ length: COMMISSION_RANK_BAND_COUNT }, (): RewardItem[] => []);

describe.todo("createEmptyBands");
