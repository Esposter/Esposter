// What every paginated read answers: its items in the list's order, and the cursor that continues after the last of them,
// "" when none is left. A read whose surface shows a total adds `count` on its first page
export interface Page<TItem> {
  items: TItem[];
  nextCursor: string;
}
