export const tagShardLines = async function* (
  lines: AsyncIterable<string>,
  index: number,
  root: string,
): AsyncGenerator<{ index: number; line: string; root: string }> {
  for await (const line of lines) yield { index, line, root };
};
