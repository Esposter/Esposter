// A scene's haze as its uniforms hold it
export interface SceneFog {
  baseHeight: number;
  color: [number, number, number];
  density: number;
  heightFalloff: number;
  scatterColor: [number, number, number];
  scatterDirection: [number, number, number];
  scatterPower: number;
  scatterStrength: number;
  startDistance: number;
}
