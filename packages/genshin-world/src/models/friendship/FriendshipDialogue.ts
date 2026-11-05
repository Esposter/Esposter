// A dialogue a character's Friendship Level opens: the level it opens at, and the quest it also waits on finished, "" for
// None. Its lines are the talk a record holds beside it, as a Serenitea Pot companion's dialogue does
export interface FriendshipDialogue {
  friendshipLevel: number;
  questId: string;
}
