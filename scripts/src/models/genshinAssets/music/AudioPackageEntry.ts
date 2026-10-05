// One file of a Wwise audio package (`.pck`): a sound bank or a streamed sound, by its id, where its bytes start in the
// Package and how many there are
export interface AudioPackageEntry {
  id: number;
  offset: number;
  size: number;
}
