// The form a building's roof takes: a hipped roof slopes on all four sides into a short ridge, a gabled roof slopes on
// Two and closes its ends with gables
export const InazumaBuildingRoof = { Gabled: "Gabled", Hipped: "Hipped" } as const;
export type InazumaBuildingRoof = (typeof InazumaBuildingRoof)[keyof typeof InazumaBuildingRoof];
