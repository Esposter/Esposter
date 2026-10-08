import type { PrecipitationUniforms } from "#src/models/atmosphere/PrecipitationUniforms";
import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { GroundCapture } from "#src/models/vegetation/GroundCapture";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";

export interface SplashMaterialOptions {
  // The ground under the camera from above, whose height a splash stands on
  groundCapture: GroundCapture;
  lightUniforms: LightUniforms;
  precipitationUniforms: PrecipitationUniforms;
  waterUniforms: WaterUniforms;
}
