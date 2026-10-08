import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { PrecipitationUniforms } from "#src/models/atmosphere/PrecipitationUniforms";
import type { WindUniforms } from "#src/models/wind/WindUniforms";

export interface PrecipitationMaterialOptions {
  lightUniforms: LightUniforms;
  precipitationUniforms: PrecipitationUniforms;
  windUniforms: WindUniforms;
}
