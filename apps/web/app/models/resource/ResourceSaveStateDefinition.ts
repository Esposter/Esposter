// What a save state looks like in the toolbar. The colour rides the icon rather than the text, and the two
// States needing nothing from the owner carry none.
export interface ResourceSaveStateDefinition {
  color?: string;
  icon: string;
  title: string;
}
