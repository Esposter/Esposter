export const computeSplitTransformation = (value: string, delimiter: string, segmentIndex: number) =>
  value.split(delimiter).at(segmentIndex) ?? null;
