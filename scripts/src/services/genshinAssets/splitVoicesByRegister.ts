// Where a piece's notes split into registers, as the lowest pitch of every register above the first: Fisher's natural
// Breaks over the notes' pitches, the split into contiguous ranges whose notes lie closest to their own range's mean,
// Found exactly by dynamic programming over the distinct pitches each weighted by its note count. A piece with fewer
// Distinct pitches than registers splits between every one
export const splitVoicesByRegister = (pitches: number[], voiceCount: number): number[] => {
  const counts = new Map<number, number>();
  for (const pitch of pitches) counts.set(pitch, (counts.get(pitch) ?? 0) + 1);
  const values = [...counts.keys()].toSorted((first, second) => first - second);
  if (values.length <= voiceCount) return values.slice(1);
  // Each prefix's weight, weighted sum and weighted sum of squares, so any range's spread is read in constant time
  const weights = [0];
  const sums = [0];
  const squares = [0];
  for (const value of values) {
    const count = counts.get(value) ?? 0;
    weights.push((weights.at(-1) ?? 0) + count);
    sums.push((sums.at(-1) ?? 0) + count * value);
    squares.push((squares.at(-1) ?? 0) + count * value ** 2);
  }
  // The spread of the values from `start` up to but not including `end` about their mean
  const readSpread = (start: number, end: number): number => {
    const weight = (weights[end] ?? 0) - (weights[start] ?? 0);
    const sum = (sums[end] ?? 0) - (sums[start] ?? 0);
    return (squares[end] ?? 0) - (squares[start] ?? 0) - sum ** 2 / weight;
  };
  // `costs[voices][end]`: the least spread of the first `end` values split into that many ranges, and where the last
  // Range starts in it
  const costs = [Array.from({ length: values.length + 1 }, (_, end) => (end === 0 ? 0 : Infinity))];
  const starts: number[][] = [[]];
  for (let voice = 1; voice <= voiceCount; voice++) {
    const voiceCosts = Array.from({ length: values.length + 1 }, () => Infinity);
    const voiceStarts = Array.from({ length: values.length + 1 }, () => 0);
    for (let end = voice; end <= values.length; end++)
      for (let start = voice - 1; start < end; start++) {
        const cost = (costs[voice - 1]?.[start] ?? Infinity) + readSpread(start, end);
        if (cost >= (voiceCosts[end] ?? Infinity)) continue;
        voiceCosts[end] = cost;
        voiceStarts[end] = start;
      }
    costs.push(voiceCosts);
    starts.push(voiceStarts);
  }
  const splits: number[] = [];
  for (let end = values.length, voice = voiceCount; voice > 1; voice--) {
    end = starts[voice]?.[end] ?? 0;
    splits.unshift(values[end] ?? 0);
  }
  return splits;
};
