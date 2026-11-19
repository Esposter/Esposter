import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { CaptureResult } from "#src/models/dungeons/item/CaptureResult";
import { getHealthRate } from "#src/services/dungeons/monster/getHealthRate";
import { createRandomNumber } from "#src/util/math/random/createRandomNumber";

export const createCaptureResult = (monster: Monster) => {
  const healthRate = getHealthRate(monster);
  const successRate = 0.5 + (1 - healthRate) * 0.2;
  const resultRate = successRate - createRandomNumber(1);
  if (resultRate >= 0) return CaptureResult.Success;
  else if (resultRate >= -0.1) return CaptureResult.NearMiss;
  else return CaptureResult.Failure;
};
