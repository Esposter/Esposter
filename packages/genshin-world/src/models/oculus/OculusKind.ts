// The Oculi the official map marks, one kind to each region's Oculi, named as the map labels them. Each kind is found once
// And offered to its region's statues
export const OculusKind = {
  Anemoculus: "Anemoculus",
  Cryoculus: "Cryoculus",
  Dendroculus: "Dendroculus",
  Electroculus: "Electroculus",
  Geoculus: "Geoculus",
  Hydroculus: "Hydroculus",
  Lunoculus: "Lunoculus",
  Pyroculus: "Pyroculus",
} as const;
export type OculusKind = (typeof OculusKind)[keyof typeof OculusKind];
