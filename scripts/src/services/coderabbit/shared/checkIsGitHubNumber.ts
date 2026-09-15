// A pull request number or a comment id: GitHub hands out positive integers, and `Number("")`, `-1` and `NaN`
// Each answer 404 at the API rather than here
export const checkIsGitHubNumber = (value: number): boolean => Number.isSafeInteger(value) && value > 0;
