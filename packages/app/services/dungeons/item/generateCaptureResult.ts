import type { Monster } from "@/models/dungeons/monster/Monster";

import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { generateRandomNumber } from "@/shared/util/math/random/generateRandomNumber";

export const generateCaptureResult = ({ stats, status }: Monster) => {
  const hpRate = status.hp / stats.maxHp;
  const successRate = 0.5 + (1 - hpRate) * 0.2;
  const resultRate = successRate - generateRandomNumber(1);
  if (resultRate >= 0) return CaptureResult.Success;
  else if (resultRate >= -0.1) return CaptureResult.NearMiss;
  else return CaptureResult.Failure;
};
