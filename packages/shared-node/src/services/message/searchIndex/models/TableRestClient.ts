import type { MessageSearchDocument } from "@/services/message/searchIndex/models/MessageSearchDocument";

export interface TableRestClient {
  listMessageRowKeysByRoom: (roomId: string) => Promise<MessageSearchDocument[]>;
  listMessagesByRoom: (roomId: string) => Promise<MessageSearchDocument[]>;
  listRoomIds: () => Promise<string[]>;
}
