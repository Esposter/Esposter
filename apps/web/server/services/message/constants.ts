// The most rooms one search reads, since each named room is a room object asked in parallel for its matches
export const MAX_SEARCH_ROOMS = 25;
// The most rooms one forward posts to, since each is a room object written to in parallel
export const MAX_FORWARD_ROOMS = 50;
// The messages one room call tombstones for a person at a time, so a soft ban over a long history is many small turns
export const DELETE_USER_MESSAGES_PAGE_LIMIT = 100;
