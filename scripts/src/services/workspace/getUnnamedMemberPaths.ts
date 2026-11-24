// The member paths a text names by none of its spellings: a path is named when it stands whole in backticks, and with
// `allowDeeperPaths` also when it leads a path under it with its separator, so `packages/db` is not answered by
// `packages/db-schema`'s row
export const getUnnamedMemberPaths = (
  text: string,
  memberPaths: readonly string[],
  { allowDeeperPaths }: { allowDeeperPaths: boolean },
): string[] =>
  memberPaths.filter(
    (memberPath) => !text.includes(`\`${memberPath}\``) && !(allowDeeperPaths && text.includes(`\`${memberPath}/`)),
  );
