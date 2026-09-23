import type { Attachment } from "#src/models/command/Attachment";
import type { PermissionBehavior } from "#src/models/command/PermissionBehavior";
import type { PermissionMode } from "#src/models/session/PermissionMode";
import type { SessionSummary } from "#src/models/session/SessionSummary";
// Everything provider-specific sits behind this: a driver lists and opens one agent's sessions, reports what
// Happens in them as the console's events (through the callbacks it was made with), and takes the page's
// Commands back. The page never learns which agent it is talking to.
export interface Driver {
  // Closes every open session and resolves once each has ended — the host's shutdown
  close: () => Promise<void>;
  closeSession: (sessionId: string) => void;
  // Each opening command resolves to the id of the session it opened
  createSession: (cwd: string) => Promise<string>;
  // An empty message uuid forks the whole conversation
  forkSession: (sessionId: string, messageUuid: string) => Promise<string>;
  interrupt: (sessionId: string) => Promise<void>;
  listSessions: () => Promise<SessionSummary[]>;
  prompt: (sessionId: string, text: string, attachments: Attachment[]) => void;
  resolvePermission: (sessionId: string, requestId: string, behavior: PermissionBehavior, message: string) => void;
  resumeAt: (sessionId: string, messageUuid: string) => Promise<string>;
  resumeSession: (sessionId: string) => Promise<string>;
  // Puts the files back as they were when the prompt under the message uuid was sent
  rewindFiles: (sessionId: string, messageUuid: string) => Promise<void>;
  runSlashCommand: (sessionId: string, name: string, commandArguments: string) => void;
  setModel: (sessionId: string, model: string) => Promise<void>;
  setPermissionMode: (sessionId: string, permissionMode: PermissionMode) => Promise<void>;
}
