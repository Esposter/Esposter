// Why a message may not be created, in the precedence the rules are evaluated in. Every path that produces a
// Message — live send, forward, scheduled delivery — decides with the same rule set and maps the answer to
// Whatever error its own transport speaks, so the two can never disagree about what is allowed.
export enum MessageCreationRejectionType {
  NotAMember = "NotAMember",
  ReadOnly = "ReadOnly",
  Slowmode = "Slowmode",
  Timeout = "Timeout",
  WordFilter = "WordFilter",
}
