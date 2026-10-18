// A mail the game sends a player: its sender, title and text by text id, the items its reward pays and the days it lasts
export interface Mail {
  contentTextId: string;
  expireDays: number;
  id: number;
  isStar: boolean;
  items: { itemId: number; quantity: number }[];
  senderTextId: string;
  titleTextId: string;
}
