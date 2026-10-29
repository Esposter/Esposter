import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// The recording a reference's `source` names: its file under the captures folder, the second its frame is cut at, and
// The crop placed before the colour conversion when the source names one
export interface RecordingSource {
  crop?: ImageRegion;
  file: string;
  second: number;
}
