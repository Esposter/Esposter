export interface RampOptions {
  resolution: number;
  // The irradiance on the shaded side of the step, as a share of the lit side's: none for a ramp dark in shade, a share
  // For one that keeps a tone there
  shade: number;
  // The width of the step between shade and lit, as a share of the ramp
  softness: number;
  // Where shade turns to lit, as a share of the ramp; a half is the light's grazing angle
  terminator: number;
}
