import type { ApexMarkers } from "apexcharts";
// One marker shape per series, in the order the series take the accent and the four status colours (`globals.scss`), so
// A series reads by its shape as well as its colour
export const ApexChartMarkerShapes = ["circle", "square", "triangle", "diamond", "star"] satisfies NonNullable<
  ApexMarkers["shape"]
>;
