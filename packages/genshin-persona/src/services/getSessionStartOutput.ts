import type { SessionStartOutput } from "#src/models/SessionStartOutput";

const GREETING_LINE_COUNT = 2;

// The whole card is context for the model; the person sees its headline and birthday line, so the greeting costs
// No tokens twice
export const getSessionStartOutput = (card: string): string => {
  const greeting = card.split("\n").slice(0, GREETING_LINE_COUNT).join("\n").replace("Persona: ", "✦ ");
  const output: SessionStartOutput = {
    hookSpecificOutput: { additionalContext: card, hookEventName: "SessionStart" },
    systemMessage: greeting,
  };
  return JSON.stringify(output);
};
