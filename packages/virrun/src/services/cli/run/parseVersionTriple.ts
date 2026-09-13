// Extracts the leading major.minor.patch triple from a version string — accepts a bare "0.11.1" or a
// `bwrap --version` line ("bubblewrap 0.11.1"); undefined when no triple is present so a garbled `--version` reads
// As unknown, never as satisfying the gate.
const VERSION_REGEX = /(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/u;

export const parseVersionTriple = (version: string): [number, number, number] | undefined => {
  const groups = VERSION_REGEX.exec(version)?.groups;
  if (groups === undefined) return undefined;
  else return [Number(groups.major), Number(groups.minor), Number(groups.patch)];
};
