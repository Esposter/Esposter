// The order the score table's rows are printed in: by the score, the default, or by the gzipped bytes a package adds to the app's bundle
export const ScoreSort = { Bundle: "bundle", Score: "score" } as const;
export type ScoreSort = (typeof ScoreSort)[keyof typeof ScoreSort];
