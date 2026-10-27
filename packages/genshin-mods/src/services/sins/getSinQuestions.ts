import type { SinName } from "./constants";

import { SIN_CRITERIA, SIN_NAMES } from "./constants";

// The question each sin asks Jev about a prompt, held beside the one call that asks them all
const SinQuestionMap = {
  envy: 'How far does the prompt measure against another tool, person or project, as in "the other tool", "like theirs" or "why doesn\'t ours do what X does"?',
  gluttony: "How heavy is the prompt, as in a large pasted share of text or a whole file or log pasted in?",
  greed:
    'How far does the prompt ask for more than one request holds, as in "and also", "while you\'re at it", "everything" or several tasks at once?',
  lust: 'How far does the prompt crave the new over the finished, as in "rewrite", "from scratch", "redesign" or "a new approach"?',
  pride:
    'How far does the prompt assert certainty and wave off checks, as in "obviously", "definitely", "no need to test" or "trust me"?',
  sloth:
    'How far is effort handed off without a steer, as in "idk", "whatever", "you decide", "figure it out" or a one-word prompt?',
  wrath:
    'How heated is the prompt\'s register, as in runs of punctuation, words in capitals, "again", "still broken" or "why won\'t"?',
} as const satisfies Record<SinName, string>;

// The seven `score` questions one call answers, keyed by sin name, each graded on the same five levels
export const getSinQuestions = () =>
  Object.fromEntries(
    SIN_NAMES.map((name) => [name, { criteria: SIN_CRITERIA, instructions: SinQuestionMap[name], type: "score" }]),
  );
