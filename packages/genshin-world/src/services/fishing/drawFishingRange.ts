// A value drawn evenly from a range given as its least and its most, by the caller's random source in [0, 1)
export const drawFishingRange = ([least = 0, most = least]: readonly number[], random: () => number): number =>
  least + (most - least) * random();
