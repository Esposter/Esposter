export interface RampOptions {
  resolution: number;
  // The width of the step between shade and lit, as a share of the ramp
  softness: number;
  // Where shade turns to lit, as a share of the ramp; a half is the light's grazing angle
  terminator: number;
}
