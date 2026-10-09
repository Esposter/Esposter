// The tar mode a transfer runs: create writes an archive of the listed files to stdout, extract reads one from stdin
export enum TarOperation {
  Create = "-c",
  Extract = "-x",
}
