// How one layer of a scene scores against its reference, over the pixels the witness's part target gives it: its share
// Of the frame, its shape (1 identical), its tone and its detail (0 identical, in percent), and its mean FLIP error (0
// Identical, 1 as far apart as two images can be)
export interface LayerScore {
  coverage: number;
  detail: number;
  flip: number;
  name: string;
  shape: number;
  tone: number;
}
