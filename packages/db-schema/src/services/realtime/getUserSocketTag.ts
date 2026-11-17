// The one spelling of the tag a person's sockets are accepted under, so a broadcast or a close names them alike
export const getUserSocketTag = (userId: string): string => `user:${userId}`;
