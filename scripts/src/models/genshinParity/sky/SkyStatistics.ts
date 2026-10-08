import type { CloudStatistics } from "#src/models/genshinParity/sky/CloudStatistics";
import type { Vector } from "#src/models/shared/Vector";

// A sky as statistics blind to where its clouds stand: its clouds' (`CloudStatistics`), their cover band by band of
// Height over the horizon (`CLOUD_ELEVATION_BANDS`), and its clear sky's and its clouds' mean colours in CIELab
export interface SkyStatistics {
  clearColour: Vector;
  cloudColour: Vector;
  clouds: CloudStatistics;
  elevationCoverage: number[];
}
