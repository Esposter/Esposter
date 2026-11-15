export const GcsimElement = {
  Anemo: "attributes.Anemo",
  Cryo: "attributes.Cryo",
  Dendro: "attributes.Dendro",
  Electro: "attributes.Electro",
  Geo: "attributes.Geo",
  Hydro: "attributes.Hydro",
  Pyro: "attributes.Pyro",
} as const;
export type GcsimElement = (typeof GcsimElement)[keyof typeof GcsimElement];
