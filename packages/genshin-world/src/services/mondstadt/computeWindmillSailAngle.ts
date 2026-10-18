// The sails' angle after a step of time: they turn as fast as the wind reaching the windmill
// So a gust that reaches it turns them faster. The rate per unit of wind is a parameter, fitted against the windmill's reference when it is found
export const computeWindmillSailAngle = (
  angle: number,
  deltaSeconds: number,
  windSpeed: number,
  radiansPerSecondPerWind: number,
): number => angle + windSpeed * radiansPerSecondPerWind * deltaSeconds;
