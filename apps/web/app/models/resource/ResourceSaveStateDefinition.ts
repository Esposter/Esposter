// What a save state looks like beside the resource's title. Why two of the four carry no colour is on
// `ResourceSaveStateDefinitionMap`, which is where those choices are made
export interface ResourceSaveStateDefinition {
  // A colour utility written whole, so the scanner generates it
  colorClass?: string;
  icon: string;
  title: string;
}
