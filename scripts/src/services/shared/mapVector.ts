import type { Vector } from "#src/models/shared/Vector";

// A three-channel vector, each channel built by calling the mapper with that channel's index
export const mapVector = (mapper: (channel: 0 | 1 | 2) => number): Vector => [mapper(0), mapper(1), mapper(2)];
