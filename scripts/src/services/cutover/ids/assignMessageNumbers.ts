export interface MessageNumber {
  number: number;
  rowKey: string;
}

// Numbers the messages of one room that have no number yet, from the number after the room's highest, in createdAt order.
// Ties are broken by row key. A message keeps the number it was given, so a re-run and a delta add only what is new.
// The numbers given now are returned, for the archive to keep
export const assignMessageNumbers = (
  messages: { createdAt: Date; rowKey: string }[],
  numberByRowKey: ReadonlyMap<string, number>,
): MessageNumber[] => {
  // Folded rather than spread, since a large room's numbers would overflow a call's arguments
  const highestNumber = numberByRowKey.values().reduce((highest, number) => Math.max(highest, number), 0);
  return messages
    .filter(({ rowKey }) => !numberByRowKey.has(rowKey))
    .toSorted(
      (left, right) => left.createdAt.getTime() - right.createdAt.getTime() || left.rowKey.localeCompare(right.rowKey),
    )
    .map(({ rowKey }, index) => ({ number: highestNumber + index + 1, rowKey }));
};
