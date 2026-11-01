// Inside keeps the element within its parent and caps the scale at the fit, outside keeps it covering its parent and floors the scale at the cover
// Automatic is inside on each axis the element fits and outside on each it overflows, with the scale floored at the fit
export enum PanzoomContain {
  Automatic = "automatic",
  Inside = "inside",
  Outside = "outside",
}
