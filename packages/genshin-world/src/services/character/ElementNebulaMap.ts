import { Element } from "#src/models/Element";

// The nebula each element's character stands over, its tint at the centre and at the edge of the scene. Geo's is sampled
// From the Xilonen frame of session-2.mp4 at 156 seconds. The others are measured off a clip of each element, at the same
// Centre and edge, and are provisional: no current-version PC clip of the character screen was found for any of them
export const ElementNebulaMap: Readonly<Record<Element, { centre: string; edge: string }>> = {
  // Clip b9Zf3nWRJpI at 24 seconds
  [Element.Anemo]: { centre: "rgb(62 163 160)", edge: "rgb(38 88 87)" },
  // Clip 8VlhnNpPF_o at 24 seconds
  [Element.Cryo]: { centre: "rgb(90 184 219)", edge: "rgb(42 99 144)" },
  // Clip Mkf6NjheSy0 at 16 seconds, a clip titled for version 3.2
  [Element.Dendro]: { centre: "rgb(101 155 58)", edge: "rgb(85 133 62)" },
  // Clip tJTFtoH3KuA at 80 seconds
  [Element.Electro]: { centre: "rgb(145 108 164)", edge: "rgb(69 41 96)" },
  [Element.Geo]: { centre: "rgb(175 149 68)", edge: "rgb(106 82 36)" },
  // Clip HnGCXQPpRK4 at 110 seconds
  [Element.Hydro]: { centre: "rgb(39 115 190)", edge: "rgb(37 62 130)" },
  // Clip RGZgV5o6hFU at 92 seconds
  [Element.Pyro]: { centre: "rgb(170 94 84)", edge: "rgb(93 43 44)" },
};
