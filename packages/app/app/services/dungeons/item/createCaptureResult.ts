import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";
import { CaptureResult } from "@/models/dungeons/item/CaptureResult";

export const createCaptureResult = ({ stats, status }: Monster) => {
  const hpRate = status.hp / stats.maxHp;
  const successRate = 0.5 + (1 - hpRate) * 0.2;
  const resultRate = successRate - createRandomNumber(1);
  if (resultRate >= 0) return CaptureResult.Success;
  else if (resultRate >= -0.1) return CaptureResult.NearMiss;
  else return CaptureResult.Failure;
};
