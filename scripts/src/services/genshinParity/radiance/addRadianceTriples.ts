import type { RadianceTriple } from "#src/models/genshinParity/radiance/RadianceTriple";

// Two triples added channel by channel, the sum returned as a new triple
export const addRadianceTriples = (sum: RadianceTriple, addend: RadianceTriple): RadianceTriple => [
  sum[0] + addend[0],
  sum[1] + addend[1],
  sum[2] + addend[2],
];
