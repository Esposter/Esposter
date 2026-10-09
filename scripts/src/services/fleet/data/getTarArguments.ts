import { TarOperation } from "#src/models/fleet/data/TarOperation";

// The arguments of one tar run in the directory: create reads the names of the files to archive from stdin and
// Writes the archive to stdout, extract reads an archive from stdin and keeps its mtimes
export const getTarArguments = (operation: TarOperation, directory: string): string[] =>
  operation === TarOperation.Create
    ? ["-c", "-f", "-", "-C", directory, "-T", "-"]
    : ["-x", "-f", "-", "-C", directory];
