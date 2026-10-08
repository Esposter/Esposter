// The bits of a PMX material's drawing flags a character reads: both faces drawn, and an edge, which is its outline
export enum PmxMaterialFlag {
  DoubleSided = 0x1,
  Outlined = 0x10,
}
