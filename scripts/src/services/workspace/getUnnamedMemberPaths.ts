// The member paths a text names by none of its spellings: a path is named when it stands whole in backticks, or leads
// A path under it with its separator, so `packages/db` is not answered by `packages/db-schema`'s row
export const getUnnamedMemberPaths = (text: string, memberPaths: readonly string[]): string[] =>
  memberPaths.filter((memberPath) => !text.includes(`\`${memberPath}\``) && !text.includes(`\`${memberPath}/`));
