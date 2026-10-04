// A cloud atlas's painted clouds as the shapes they are drawn with, each cell's outline and lit crown as loops in its
// Own unit square, and a cell's width over its height
export interface CloudAtlas {
  aspect: number;
  sprites: { lit: [number, number][][]; outline: [number, number][][] }[];
}
