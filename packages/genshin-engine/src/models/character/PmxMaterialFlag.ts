// The bits of a PMX material's drawing flags a character reads: both faces drawn, and an edge, which is its outline
export const PmxMaterialFlag = { DoubleSided: 0x1, Outlined: 0x10 } as const;
export type PmxMaterialFlag = (typeof PmxMaterialFlag)[keyof typeof PmxMaterialFlag];
