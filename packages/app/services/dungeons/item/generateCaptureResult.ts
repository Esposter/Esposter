import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { generateRandomNumber } from "@/util/math/random/generateRandomNumber";

export const generateCaptureResult = () => {
  const successRate = 0.5;
  const resultRate = generateRandomNumber(1);
  if (resultRate - successRate <= 0) return CaptureResult.Success;
  else if (resultRate - successRate <= 0.1) return CaptureResult.NearMiss;
  else return CaptureResult.Failure;
};
