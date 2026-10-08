import type { PrecipitationUniforms } from "#src/models/atmosphere/PrecipitationUniforms";
import type { SkyUniforms } from "#src/models/atmosphere/SkyUniforms";
import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { FogUniforms } from "#src/models/post/FogUniforms";

// Everything a weather moves: the sky's clouds, the haze, the ground's wetness and the particles
export interface WeatherTargets {
  fogUniforms: FogUniforms;
  lightUniforms: LightUniforms;
  precipitationUniforms: PrecipitationUniforms;
  skyUniforms: SkyUniforms;
}
