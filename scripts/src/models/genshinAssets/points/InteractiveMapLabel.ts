// A label of the official map's tree as its label tree gives it: its id, its name in the map's English and the labels
// Under it, the top-level ones being the categories the map files its marks in
export interface InteractiveMapLabel {
  children: InteractiveMapLabel[];
  id: number;
  name: string;
}
