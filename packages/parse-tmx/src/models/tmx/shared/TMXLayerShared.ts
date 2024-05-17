export interface TMXLayerShared {
  id: number;
  name: string;
  type: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  locked?: number;
  opacity?: number;
  visible?: number;
  tintcolor?: string;
  offsetx?: number;
  offsety?: number;
  parallaxx?: number;
  parallaxy?: number;
}
