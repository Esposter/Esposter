export interface ChatRoom {
  id: string;
  avatar: string;
  name: string;
  subtitle: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
}
