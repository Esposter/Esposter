// A word of the camera profile's global config: the field's name as the 2022 dummy scripts give it, or "" for a field
// The build added since, and whether it is a flag, a boolean or a switch held as a whole word of 0 or 1
export interface CameraConfigField {
  isFlag?: true;
  name: string;
}
