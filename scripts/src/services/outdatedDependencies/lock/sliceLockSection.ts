export const sliceLockSection = (lockYaml: string, startMarker: string, endMarkers: string[]): string => {
  const start = lockYaml.indexOf(startMarker);
  if (start === -1) return "";

  const end = Math.min(
    lockYaml.length,
    ...endMarkers.map((marker) => lockYaml.indexOf(marker, start + 1)).filter((index) => index !== -1),
  );
  return lockYaml.slice(start, end);
};
