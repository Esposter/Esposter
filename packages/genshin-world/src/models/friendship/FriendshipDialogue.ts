// A dialogue a character's Friendship Level opens: the level it opens at, and the quest it also waits on finished, "" for
// None. The lines are the game's own, looked up by the dialogue's id once the game's dialogue table is read
export interface FriendshipDialogue {
  friendshipLevel: number;
  questId: string;
}
