export const sliceLockSection = (lockYaml: string, startMarker: string, endMarkers: string[]): string => {
  const start = lockYaml.indexOf(startMarker);
  if (start === -1) return "";

  let end = lockYaml.length;
  for (const marker of endMarkers) {
    const index = lockYaml.indexOf(marker, start + 1);
    if (index !== -1 && index < end) end = index;
  }

  return lockYaml.slice(start, end);
};
