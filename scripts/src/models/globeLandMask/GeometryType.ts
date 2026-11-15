// The GeoJSON geometry kinds a country's shape takes: one polygon, or several
export const GeometryType = { MultiPolygon: "MultiPolygon", Polygon: "Polygon" } as const;
export type GeometryType = (typeof GeometryType)[keyof typeof GeometryType];
