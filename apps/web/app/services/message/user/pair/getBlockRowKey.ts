// The key of a block row: the blocker and the blocked user, in the order the table's composite key names them
export const getBlockRowKey = (blockerId: string, blockedId: string): [string, string] => [blockerId, blockedId];
