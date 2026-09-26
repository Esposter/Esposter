# Jev — the Typed Decision Tier

Read when a judgement goes to Jev: its three primitives, batching, the confidence gate and the one call path.

Three primitives — `choice` picks one of a defined set, `noul` returns the probability that a yes/no question is yes, `score` places the state on ordered levels and returns the distribution with it.

- **Every independent question about one state goes in one call**, keyed by name. The state is read once and each answer comes back under its key; a second call for a second question re-sends the state.
- **Confidence gates the escalation, not the answer.** Under its gate nothing acts on the answer — the case goes up a tier. Every gate the estate has today decides something that writes outside the checkout (a label on someone's issue, a merge), so `HIGH_STAKES_CONFIDENCE` (`scripts/src/services/jev/constants.ts`) is the only threshold there is: the cost of being wrong is not a retry. A lower-stakes consumer names its own floor beside it when it arrives, and not before — a threshold nothing reads is a rule nothing holds.
- A `noul` returns a probability and no separate confidence: the distance from `0.5` is the confidence.
- **Every call goes through `scripts/src/services/jev/readAnswers.ts`**, which answers nothing when no key is configured and never throws, so a gate written against it escalates on its own. Nothing else constructs a client, and a test never reaches one.
- The call surface, the cookbooks and the response fields are TypeSafe's own `typesafe@typesafe-ai` plugin skill's; what this skill owns is which questions belong there at all, and `apps/web/content/docs/infra/typed-decisions.md` is where the estate's own use of it is written down.
