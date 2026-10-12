import { DialogueChoiceIcon } from "#src/models/DialogueChoiceIcon";

// Each dialogue choice's mark, traced from the wiki's copy of the game's own file and kept in its own view box, drawn in
// The reply's own colour. A trace takes the ink's silhouette, so two are provisional: the quest's ring and its
// Exclamation mark trace as one disc with no mark in it, and the story quest's nested diamonds as one diamond, until
// Each inner mark is split from its outline and the game's gold read
export const DialogueChoiceIconPathMap: Record<DialogueChoiceIcon, { d: string; viewBox: string }> = {
  [DialogueChoiceIcon.Quest]: {
    d: "m140.5 22h19l1 1h8l1 1h5l1 1 11 2 9 3 3 2h2l12 6 14 9 22.5 21.5 13 19 6 12v2l2 3 3 9v3l3 9v5l1 1v8l1 1v19l-1 1v8l-1 1v5l-1 1-2 11-3 9-2 3v2l-6 12-13 19-17.5 17.5-19 13-12 6h-2l-3 2-9 3h-3l-9 3h-5l-1 1h-8l-1 1h-19l-1-1h-8l-1-1h-5l-1-1-11-2-9-3-3-2h-2l-12-6-19-13-17.5-17.5-13-19-6-12v-2l-2-3-3-9v-3l-3-9v-5l-1-1v-8l-1-1v-19l1-1v-8l1-1v-5l1-1 2-11 3-9 2-3v-2l6-12 13-19 17.5-17.5 14-10 17-9h2l3-2 9-3h3l9-3q4.75 1.25 6-1h8l1-1z",
    viewBox: "0 0 300 300",
  },
  [DialogueChoiceIcon.StoryQuest]: {
    d: "m63.5 18h2l45.5 45.5v2l-45.5 45.5h-2l-45.5-45.5v-2l45.5-45.5z",
    viewBox: "0 0 128 128",
  },
  [DialogueChoiceIcon.Talk]: {
    d: "m65 0h46.5q.88.04.5 3h1.5l1 1 9 1 4 3 6 1 3 3h2l5 4 3 1 6.5 5.5q-.75 2.25 1.5 1.5 3 1.12 2.5 4l3 1.5 8 10q.35 5.15 4 7l1 7 1 2.5 2 .5v35.5q-2.67-1.12-2 1.5l-1 1-1 6q-3.18 2.32-4 7-6.72 9.78-15.5 17.5l-5 4h-1.5v2.5l3 5 8 9 1 3-1 3 1 2-2.5 3.5-2.5 1.5-.5 1.5h-29.5q1.13-2.67-1.5-2l-7-3-8-8-6-1-1 1h-23l-6-2-12-1-5-3-6-1-4-3-4-1-15-11-8.5-8.5-7-9-1-4-3-3-2-8.5q-2.96.38-3-.5v-35.5h3v-1.5l1-1 1-7q3.65-1.85 4-7l9.5-11.5q2.25.75 1.5-1.5 1.12-3 4-2.5l1.5-3 11-8 4-1 3-3 6-1 4-3 9-1 2.5-1v-3zm22 8-1 1h-13l-6 3-9 1-4 3-6 1-3 3-4 1-11 8-2 3-3 1v2l-8 9q0 5-4 7l-1 7-3 5v23l3 5 1 6 3 3 1 4 8 10 13 10q4 1 6 4l6 2 2 2 6 1 6 3 12 1q1 2 6 1l1 1h12q1-2 6-1l1-1h8l3 5 8 6 10 4h18v-2l-5-5-6-9-2-5v-4l14-11 10-12 1-4 3-3 1-6 3-5v-23l-3-5-1-7-3-3-1-4-8-9q1-3-1-2l-2-2-12-10-4-1-3-3-6-1-4-3-9-1-6-3h-13q-2-2-5-1zm-39.5 58h3l5.5 3.5 2 4v4l-4.5 6.5h-8l-4.5-4.5v-9l1.5-1.5 5-3zm39 0h4q1.85 2.85 5.5 3-.75 2.58 1 3.5v6l-2 4.5q-3 2-10.5 1l-2.5-1-2-5.5v-5q1.75-.92 1-3.5 3.65-.15 5.5-3zm40 0h3l6.5 4.5v9l-4.5 4.5h-8l-2.5-2.5-2-4v-4l3.5-5.5 4-2z",
    viewBox: "0 0 176 160",
  },
};
