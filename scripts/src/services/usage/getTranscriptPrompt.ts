import { USER_MARKER } from "#src/services/usage/constants";
import { getUserPromptText } from "#src/services/usage/getUserPromptText";
import { readTranscriptLine } from "#src/services/usage/readTranscriptLine";

// The first user message that carries text, which opens the transcript; empty when none does
export const getTranscriptPrompt = (lines: readonly string[]): string => {
  for (const line of lines) {
    if (!line.includes(USER_MARKER)) continue;
    const transcriptLine = readTranscriptLine(line);
    const text = transcriptLine?.type === "user" ? getUserPromptText(transcriptLine.message?.content) : undefined;
    if (text) return text;
  }
  return "";
};
