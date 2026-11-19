// The light a pixel is sorted into for the radiance table: lit where our render's sun reaches it, shaded where a shadow
// Stands on it, and both together, the family's whole
export const RadianceLight = { All: "all", Lit: "lit", Shaded: "shaded" } as const;
export type RadianceLight = (typeof RadianceLight)[keyof typeof RadianceLight];
