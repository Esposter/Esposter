// How alike two images are in shape and in light, for a scene that is rebuilt rather than copied
export interface StructureScores {
  // The edges both share, as an F-score from 0 (none) to 1 (every edge of each found in the other)
  edgeScore: number;
  // The mean difference of their colour blurred past any texture, as a percentage, 0 being identical
  toneDifference: number;
}
