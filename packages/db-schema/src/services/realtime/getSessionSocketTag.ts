// The one spelling of the tag a session's sockets are accepted under, so a broadcast or a close names them alike
export const getSessionSocketTag = (sessionId: string): string => `session:${sessionId}`;
