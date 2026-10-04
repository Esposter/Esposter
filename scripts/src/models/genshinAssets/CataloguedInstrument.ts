import type { SampledInstrument } from "#src/models/genshinAssets/SampledInstrument";
import type { SampleRegion } from "#src/models/genshinAssets/SampleRegion";

// A sampled instrument with its mapping read: its name, the mapping's file name, and every region a note plays
export interface CataloguedInstrument extends SampledInstrument {
  name: string;
  regions: SampleRegion[];
}
