import type { HeldOutEqualiser } from "#src/models/genshinParity/music/HeldOutEqualiser";

export const formatEqualiser = ({ distance, equalisedDistance, heldOutDistance }: HeldOutEqualiser): string =>
  `equalised ${equalisedDistance.toFixed(2)} dB in place and ${heldOutDistance.toFixed(2)} held out across time, from ${distance.toFixed(2)}`;
