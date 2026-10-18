// The nodes a check has accepted so far, counted, and the ids they hold, so a repeated id is refused wherever it sits
export interface BlockCollection {
  count: number;
  ids: Set<string>;
}
