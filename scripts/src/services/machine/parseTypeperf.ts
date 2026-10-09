// The GPU 3D utilisation `typeperf` reports, summed over its instances in the last row it printed, or none when no
// Counter had a value. The header row names the counters and is never the last row, so it reads as none only if the data row is missing
export const parseTypeperf = (output: string): number | undefined => {
  const dataRow = output
    .split("\n")
    .map((line) => line.trim())
    .findLast((line) => line.startsWith('"'));
  if (dataRow === undefined) return undefined;
  const values = dataRow
    .split('","')
    .slice(1)
    .map((field) => Number(field.replaceAll('"', "")))
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) return undefined;
  return values.reduce((total, value) => total + value, 0);
};
