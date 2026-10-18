// One row of the game's mail table, whose keys the dump does not name are left out of it
export interface ExcelMailRow {
  contentTextMapHash: number;
  expireDays: number;
  id: number;
  isStar?: boolean;
  rewardId?: number;
  senderTextMapHash: number;
  titleTextMapHash: number;
  type?: string;
}
