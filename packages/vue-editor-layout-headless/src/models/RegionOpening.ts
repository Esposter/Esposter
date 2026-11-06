// How a region comes open: with its content, open whenever it holds a panel, or on demand, open or closed by the reader
export enum RegionOpening {
  OnDemand = "onDemand",
  WithContent = "withContent",
}
