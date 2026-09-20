// The JSON a session-start hook may print instead of plain text, spelled as the tool spells it: a line the terminal
// Shows the person, and context only the model sees
export interface SessionStartOutput {
  hookSpecificOutput: {
    additionalContext: string;
    hookEventName: "SessionStart";
  };
  systemMessage: string;
}
