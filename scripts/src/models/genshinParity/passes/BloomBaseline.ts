// A reference's bloom baseline at one measurement: the reference and our frame without the bloom, at the display width,
// And the height both are read at, every structure of the bloom is read against them
export interface BloomBaseline {
  height: number;
  reference: Buffer;
  unbloomed: Buffer;
}
