import { SampleLibrary } from "#src/models/genshinAssets/SampleLibrary";

// The commit each library is read at, the head of the branch holding its SFZ mappings beside its samples, so a
// Catalogue and the samples a fit chose never move under it
export const SampleLibraryCommitMap = {
  [SampleLibrary.Vcsl]: "dfcf4a4918771eee884b96ad4493de82ef84daf6",
  [SampleLibrary.Vsco2]: "6dd651d55dde97fd4028699be9d4481f26917891",
} as const satisfies Record<SampleLibrary, string>;
