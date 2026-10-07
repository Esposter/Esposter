import { SampleLibrary } from "#src/models/genshinAssets/shared/SampleLibrary";

// The commit each library is read at, the head of the branch holding its SFZ mappings beside its samples, so a
// Catalogue and the samples a fit chose never move under it
export const SampleLibraryCommitMap: Record<SampleLibrary, string> = {
  [SampleLibrary.DsmolkenDoubleBass]: "c2985eb647109d2a8f30a70071e3e163339d7396",
  [SampleLibrary.KaroryferBigcatCello]: "6fd75fbfc1dbb3109bf26220ba1adea46188a18b",
  [SampleLibrary.OsirisPiano]: "18c6afccb60cff458edbf7c394571783e074e1e9",
  [SampleLibrary.Vcsl]: "dfcf4a4918771eee884b96ad4493de82ef84daf6",
  [SampleLibrary.Vsco2]: "6dd651d55dde97fd4028699be9d4481f26917891",
};
