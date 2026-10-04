// One instance of a hull where the scene stands it, in three's axes
export interface HullPlacement {
  hull: string;
  position: [number, number, number];
  rotation: number[];
  scale: number[];
}
