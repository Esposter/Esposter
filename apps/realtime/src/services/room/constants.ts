// The row the room keeps its own state in. A room has one state row, so it has one fixed id
export const ROOM_STATE_ID = 1;
// How long a message's room-activity fan-out waits for the window's other messages, so a burst is one wave
export const ROOM_ACTIVITY_DELAY_MS = 2000;
// The most messages a socket is replayed when it connects with the id it last heard.
// So a long absence cannot hold the connection; the client refreshes its loaded window for anything beyond it
export const MESSAGE_REPLAY_LIMIT = 100;
// The close code a socket gets when its member is removed from the room, in the range an application may use
export const ROOM_MEMBER_REMOVED_CODE = 4003;
