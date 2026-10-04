import type { SampleRegion } from "#src/models/genshinAssets/music/SampleRegion";
import type { SampledInstrument } from "#src/models/genshinAssets/shared/SampledInstrument";

// A sampled instrument with its mapping read: its name, the mapping's file name, and every region a note plays
export interface CataloguedInstrument extends SampledInstrument {
  name: string;
  regions: SampleRegion[];
}
