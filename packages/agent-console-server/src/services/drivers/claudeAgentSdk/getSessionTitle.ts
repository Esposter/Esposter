import type { SDKSessionInfo } from "@anthropic-ai/claude-agent-sdk";

// The title the terminal's own session picker shows: a name the person gave it, else the summary, else how it began
export const getSessionTitle = ({ customTitle, firstPrompt, summary }: SDKSessionInfo): string =>
  customTitle || summary || firstPrompt || "";
