import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { createRandomNumber } from "@/util/math/random/createRandomNumber";

export const createCaptureResult = ({ statistics, status }: Monster) => {
  const healthRate = status.health / statistics.maxHealth;
  const successRate = 0.5 + (1 - healthRate) * 0.2;
  const resultRate = successRate - createRandomNumber(1);
  if (resultRate >= 0) return CaptureResult.Success;
  else if (resultRate >= -0.1) return CaptureResult.NearMiss;
  else return CaptureResult.Failure;
};
