// A family of a scene's parts as its fitted data places them, beside the exports' objects it stands for by name, so
// A fit that drifts from the exports shows as a distance
export interface ArrangementFamily {
  name: string;
  nameRegex: RegExp;
  readPositions: () => Promise<[number, number, number][]>;
}
