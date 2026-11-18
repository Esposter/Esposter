// A value of a pass's render state: the float the pass sets it to and the name of the material property that drives
// It, empty where the shader sets it as a literal
export interface SerializedShaderFloat {
  name: string;
  value: number;
}
