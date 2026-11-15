// Of the two parties to a request or a friendship, the one that is not the person
export const getOtherUserId = (userId: string | undefined, receiverId: string, senderId: string) =>
  senderId === userId ? receiverId : senderId;
