// How a query is opened: a new session, a resumed one, a fork of one, or one rewound to a message. The session
// Id is the one the host will address it by — for a new session or a fork, one the host chose and the SDK adopts.
export interface OpenSessionOptions {
  cwd: string;
  isFork: boolean;
  resumeAt: string;
  resumeFrom: string;
  sessionId: string;
}
