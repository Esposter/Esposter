// Storage's `sequencer` is an opaque hex string, and its ordering is defined only per blob. Azure documents the
// Comparison as: pad the shorter value with leading zeros to a common length, then compare lexicographically.
// Parsing it as a number is the tempting version and the wrong one — it is far wider than a double, so two
// Distinct sequencers round to one value and the comparison silently starts answering false.
// A row that has never seen an event has no position, so the first event is always newer than nothing.
export const checkIsNewerSequencer = (sequencer: string, countedSequencer?: string): boolean => {
  if (countedSequencer === undefined || countedSequencer.length === 0) return true;
  const length = Math.max(sequencer.length, countedSequencer.length);
  return sequencer.padStart(length, "0") > countedSequencer.padStart(length, "0");
};
