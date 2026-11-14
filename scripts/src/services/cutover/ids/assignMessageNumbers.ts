export interface MessageNumber {
  number: number;
  rowKey: string;
}

// Numbers the messages of one room that have no number yet, from the number after the room's highest, in createdAt order with
// ties broken by row key. A message keeps the number it was given, so a re-run and a delta add only what is new. Returns the
// numbers given now, for the archive to keep
export const assignMessageNumbers = (
  messages: { createdAt: Date; rowKey: string }[],
  numberByRowKey: ReadonlyMap<string, number>,
): MessageNumber[] => {
  const highestNumber = Math.max(0, ...numberByRowKey.values());
  return messages
    .filter(({ rowKey }) => !numberByRowKey.has(rowKey))
    .sort(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime() || left.rowKey.localeCompare(right.rowKey),
    )
    .map(({ rowKey }, index) => ({ number: highestNumber + index + 1, rowKey }));
};
