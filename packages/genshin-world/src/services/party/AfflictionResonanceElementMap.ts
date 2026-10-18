import { Element } from "#src/models/Element";

// The element of the Resonance that shortens each element's afflictions on a member: Fervent Flames' Pyro shortens Cryo,
// Soothing Water's Hydro shortens Pyro, High Voltage's Electro shortens Hydro and Shattering Ice's Cryo shortens Electro
export const AfflictionResonanceElementMap: Readonly<Partial<Record<Element, Element>>> = {
  [Element.Cryo]: Element.Pyro,
  [Element.Electro]: Element.Cryo,
  [Element.Hydro]: Element.Electro,
  [Element.Pyro]: Element.Hydro,
};
