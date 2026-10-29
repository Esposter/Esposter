import { Element } from "#src/models/Element";

// Each element's mark colour as Party Setup draws it, measured off the mark's pixels in the party reference. Only the four
// elements that frame shows are measured; a member of another element keeps the screen's text colour until its frame is measured
export const ElementMarkColorMap: Partial<Record<Element, string>> = {
  [Element.Anemo]: "#7dd0bb",
  [Element.Dendro]: "#8cb632",
  [Element.Electro]: "#ae80e0",
  [Element.Pyro]: "#da8757",
};
