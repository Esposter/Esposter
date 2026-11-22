import { SinName } from "../../models/SinName";

// The question each sin asks Jev about a prompt, read by the one call that asks them all
export const SinQuestionMap = {
  [SinName.Envy]:
    'How far does the prompt measure against another tool, person or project, as in "the other tool", "like theirs" or "why doesn\'t ours do what X does"?',
  [SinName.Gluttony]: "How heavy is the prompt, as in a large pasted share of text or a whole file or log pasted in?",
  [SinName.Greed]:
    'How far does the prompt ask for more than one request holds, as in "and also", "while you\'re at it", "everything" or several tasks at once?',
  [SinName.Lust]:
    'How far does the prompt crave the new over the finished, as in "rewrite", "from scratch", "redesign" or "a new approach"?',
  [SinName.Pride]:
    'How far does the prompt assert certainty and wave off checks, as in "obviously", "definitely", "no need to test" or "trust me"?',
  [SinName.Sloth]:
    'How far is effort handed off without a steer, as in "idk", "whatever", "you decide", "figure it out" or a one-word prompt?',
  [SinName.Wrath]:
    'How heated is the prompt\'s register, as in runs of punctuation, words in capitals, "again", "still broken" or "why won\'t"?',
} as const satisfies Record<SinName, string>;
