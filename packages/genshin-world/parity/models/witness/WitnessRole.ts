// The part an object of the witness's scene plays in a read: a family group the exports stand as, our own piece of a
// Family, or a copy of an export that rides one of our pieces (`rideLoginWitnessDoor`), which is the export's geometry
// Drawn a second time
export const WitnessRole = { Export: "export", Ours: "ours", RideCopy: "rideCopy" } as const;
export type WitnessRole = (typeof WitnessRole)[keyof typeof WitnessRole];
