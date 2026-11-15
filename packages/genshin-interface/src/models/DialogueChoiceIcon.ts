// The mark beside a dialogue choice, named as the wiki's transcripts name the game's: a reply or a chat, a choice that
// Starts a quest, and one that starts a story quest
export const DialogueChoiceIcon = { Quest: "Quest", StoryQuest: "StoryQuest", Talk: "Talk" } as const;
export type DialogueChoiceIcon = (typeof DialogueChoiceIcon)[keyof typeof DialogueChoiceIcon];
