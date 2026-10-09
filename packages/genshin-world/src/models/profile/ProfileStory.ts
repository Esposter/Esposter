// A story on a character's Profile tab in one language: its title and its text, and the Friendship Level it opens at, 0 when
// No level does. A condition other than a level keeps it locked whatever the level
export interface ProfileStory {
  friendshipLevel: number;
  hasOtherCondition: boolean;
  text: string;
  title: string;
}
