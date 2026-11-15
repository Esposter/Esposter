// The sharp features a ground's hills smear, each fitted where its residual is largest
export const TerrainFeatureKind = { Cliff: "cliff", Plateau: "plateau", Ridge: "ridge" } as const;
export type TerrainFeatureKind = (typeof TerrainFeatureKind)[keyof typeof TerrainFeatureKind];
