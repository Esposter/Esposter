// The clause a read's condition on a column sits in. A condition in the ON clause of a left join, on the table that
// Join Brings, keeps the join's partner rows whatever it removes. A condition anywhere else can remove a row the
// Table's topics Must still reach
export const FilterSite = { JoinOn: "joinOn", LeftJoinOn: "leftJoinOn", Where: "where" } as const;
export type FilterSite = (typeof FilterSite)[keyof typeof FilterSite];
