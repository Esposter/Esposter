import type { WhiteBalance } from "#src/models/post/WhiteBalance";

import { Matrix3 } from "three";

// Linear sRGB to the LMS cone space and back, as Unity's post-processing balances white in (its Colors.hlsl)
const LINEAR_TO_LMS = new Matrix3().set(
  0.390405,
  0.549941,
  0.00892632,
  0.0708416,
  0.963172,
  0.00135775,
  0.0231082,
  0.128021,
  0.936245,
);
const LMS_TO_LINEAR = new Matrix3().set(
  2.85847,
  -1.62879,
  -0.024891,
  -0.210182,
  1.1582,
  0.000324281,
  -0.041812,
  -0.118169,
  1.06867,
);
// D65's white in LMS, which a balance of none keeps
const D65_LMS = [0.949237, 1.03542, 1.08728] as const;
const balance = new Matrix3();
// The matrix a white balance multiplies a linear colour by, as Unity's ColorUtilities.ComputeColorBalance builds it:
// The temperature moves the white point's x off D65's along the daylight locus and the tint its y, and each LMS channel
// Is scaled by D65's over that white point's. The uber pass draws it as _WhiteBalanceMat before the tone curve, so a
// Cooled white takes a saturated blue's red a hair under none (the login's Display.reference.ts). Written into the
// Matrix given, so a caller that runs it every frame allocates nothing
export const computeWhiteBalance = (
  { temperature, tint }: WhiteBalance,
  whiteBalance: Matrix3 = new Matrix3(),
): Matrix3 => {
  const temperatureShare = temperature / 65;
  const x = 0.31271 - temperatureShare * (temperatureShare < 0 ? 0.1 : 0.05);
  const y = 2.87 * x - 3 * x * x - 0.27509507 + (tint / 65) * 0.05;
  const whiteX = x / y;
  const whiteZ = (1 - x - y) / y;
  balance.set(
    D65_LMS[0] / (0.7328 * whiteX + 0.4296 - 0.1624 * whiteZ),
    0,
    0,
    0,
    D65_LMS[1] / (-0.7036 * whiteX + 1.6975 + 0.0061 * whiteZ),
    0,
    0,
    0,
    D65_LMS[2] / (0.003 * whiteX + 0.0136 + 0.9834 * whiteZ),
  );
  return whiteBalance.copy(LMS_TO_LINEAR).multiply(balance).multiply(LINEAR_TO_LMS);
};
