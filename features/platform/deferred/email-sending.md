# Email Sending

Actually delivering email-editor output (survey invites, personalized campaigns) to recipients.

## Why deferred

Needs new infrastructure (Azure Communication Services or SendGrid), a verified sending domain, spam/compliance handling (SPF/DKIM, unsubscribe), and recipient management — a whole subsystem with real cost, while every prior phase ships value without it. The ACS SDK is TypeScript, so feasibility is not the blocker; cost and scope are.

## Revisit when

Phase 5 (merge fields + HTML export) has shipped and exported-then-sent-manually proves too painful for a real use case.

## Cheaper interim

Export personalized HTML and send through any external tool; distribute survey links via esbabbler or copied URLs.
