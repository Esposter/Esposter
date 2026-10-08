// How one layer of a scene scores against its reference, over the pixels the witness's part target gives it: its share
// Of the frame, the CIELab distance between its mean colours, its shape (1 identical), its tone and its detail (0
// Identical, in percent), and its mean FLIP error (0 identical, 1 as far apart as two images can be)
export interface LayerScore {
  colour: number;
  coverage: number;
  detail: number;
  flip: number;
  name: string;
  shape: number;
  tone: number;
}
