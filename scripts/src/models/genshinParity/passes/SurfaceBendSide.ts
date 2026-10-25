// One side of a view's shape: its normal target as drawn, its normal target before any normal detail, and its part target
export interface SurfaceBendSide {
  geometryNormal: Float32Array;
  normal: Float32Array;
  part: Float32Array;
}
