// The layers a background-image value holds, one per comma outside any parentheses or quotes, since a gradient's own
// Commas do not start a layer. A blank value holds none
export const splitBackgroundLayers = (value: string): string[] => {
  if (value.trim() === "") return [];

  const layers: string[] = [];
  let layer = "";
  let depth = 0;
  // The quote mark the layer is inside of, or an empty string outside any quote
  let quote = "";
  for (const character of value) {
    if (quote !== "") {
      if (character === quote) quote = "";
      layer += character;
    } else if (character === "," && depth === 0) {
      layers.push(layer.trim());
      layer = "";
    } else {
      if (character === '"' || character === "'") quote = character;
      else if (character === "(") depth++;
      else if (character === ")") depth--;
      layer += character;
    }
  }
  layers.push(layer.trim());

  return layers;
};
