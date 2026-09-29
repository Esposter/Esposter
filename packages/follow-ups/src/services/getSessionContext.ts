import type { SessionContext } from "#src/models/SessionContext";

// The lines the session starts with, which the capture and drain skills read the values from
export const getSessionContext = ({ listId, repository, sessionId, timeZone }: SessionContext): string =>
  [
    "Follow-ups: pass these values unchanged to the follow-up tools.",
    `- list id: ${listId}`,
    repository
      ? `- repository: ${repository}`
      : "- repository: none — this folder has no origin remote, so write no follow-up here",
    `- session id: ${sessionId}`,
    `- time zone: ${timeZone}`,
  ].join("\n");
