import type { PrecipitationKind } from "#src/models/atmosphere/PrecipitationKind";

// The weather as it stands at a moment, part way from one weather to the next while it changes: what each weather's
// Settings hold, flattened so a moment is blended field by field. The haze's own colour is the weather's that sets one,
// As the palette sees it in sRGB, held by its share from none to all; the particles are one kind at a time, none where
// Their density is none; and lightning strikes at its rate, in strikes a minute
export interface WeatherState {
  cloudCoverage: number;
  fogColor: number;
  fogColorAmount: number;
  fogDensity: number;
  lightningRate: number;
  precipitationDensity: number;
  precipitationKind: PrecipitationKind;
  wetness: number;
}
