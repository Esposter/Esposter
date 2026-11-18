// The kind of a join a read makes: an inner join or a condition that matches rows on both sides, a left join, or an `in`
// Over a subquery's column
export const JoinKind = { Inner: "inner", Left: "left", Subquery: "subquery" } as const;
export type JoinKind = (typeof JoinKind)[keyof typeof JoinKind];
