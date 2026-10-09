// The files of an official release a player picked, its archive or its extracted folder: its name, every file's path in
// It, separated by slashes, and the files at the paths asked for, in their order, with nothing else read
export interface PickedCharacterPack {
  name: string;
  paths: readonly string[];
  readFiles: (paths: readonly string[]) => Blob[];
}
