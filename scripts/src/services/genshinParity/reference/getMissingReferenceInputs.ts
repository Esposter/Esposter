// The inputs a reference's comparison reads from disk that are not there yet, each named with its path: its reference
// Image and, for a reference judged by a component's witness, that witness's layout. Pure over the paths, `exists`
// Telling whether one is on disk, so `compare --all` reports a reference it cannot measure yet before opening a page
export const getMissingReferenceInputs = (
  referencePath: string,
  witnessLayoutPath: string | undefined,
  exists: (path: string) => boolean,
): string[] => {
  const missing: string[] = [];
  if (!exists(referencePath)) missing.push(`reference image at ${referencePath}`);
  if (witnessLayoutPath !== undefined && !exists(witnessLayoutPath))
    missing.push(`witness layout at ${witnessLayoutPath}`);
  return missing;
};
