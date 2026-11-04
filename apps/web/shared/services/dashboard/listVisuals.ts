// Every visual of a tree, depth-first: a group comes before the visuals it holds, so a count or a search reads the whole
// Tree once
export const listVisuals = <TVisual extends { visuals?: TVisual[] }>(visuals: TVisual[]): TVisual[] =>
  visuals.flatMap((visual) => [visual, ...listVisuals(visual.visuals ?? [])]);
