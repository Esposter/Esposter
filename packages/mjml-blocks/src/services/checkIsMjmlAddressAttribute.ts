// An attribute holding an address the browser follows, whose scheme the schema checks
export const checkIsMjmlAddressAttribute = (name: string): boolean =>
  ["href", "src", "thumbnails-src"].includes(name) || name.endsWith("-url") || name.endsWith("-icon");
