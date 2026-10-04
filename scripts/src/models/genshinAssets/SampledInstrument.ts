import type { SampleLibrary } from "#src/models/genshinAssets/SampleLibrary";

// An instrument a voice may be played by: its library, and the path of its SFZ mapping within it
export interface SampledInstrument {
  library: SampleLibrary;
  mapping: string;
}
