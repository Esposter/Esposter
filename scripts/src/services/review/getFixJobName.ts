// The name `Review.yaml` gives the fix job of one review issue, `Fix issue #${{ matrix.issue }}`
export const getFixJobName = (issue: number): string => `Fix issue #${issue}`;
