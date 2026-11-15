// An input a reference's comparison reads from disk that is not there yet, named as the run prints it
export const MissingReferenceInputKind = {
  Plate: "plate",
  ReferenceImage: "reference image",
  WitnessLayout: "witness layout",
} as const;
export type MissingReferenceInputKind = (typeof MissingReferenceInputKind)[keyof typeof MissingReferenceInputKind];
