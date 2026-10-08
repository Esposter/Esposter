import type { PrecipitationKind } from "#src/models/atmosphere/PrecipitationKind";

// The particles a weather falls, and the share of the volume's particles drawn, from none to all
export interface WeatherPrecipitation {
  density: number;
  kind: PrecipitationKind;
}
