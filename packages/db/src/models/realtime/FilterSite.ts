// The clause a read's condition on a column sits in.
// A left join's ON-clause condition on the table the join brings keeps the join's partner rows whatever it removes.
// A condition anywhere else can remove a row the table's topics must still reach
export const FilterSite = { JoinOn: "joinOn", LeftJoinOn: "leftJoinOn", Where: "where" } as const;
export type FilterSite = (typeof FilterSite)[keyof typeof FilterSite];
