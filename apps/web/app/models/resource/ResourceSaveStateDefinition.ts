// What a save state looks like in the toolbar. Why the colour rides the icon, and why two of the four carry
// None, is on `ResourceSaveStateDefinitionMap`, which is where those choices are made
export interface ResourceSaveStateDefinition {
  color?: string;
  icon: string;
  title: string;
}
