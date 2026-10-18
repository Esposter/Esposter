# Email sending

Actually delivering email-editor output (survey invites, personalized campaigns) to recipients.

## Why deferred

Needs new infrastructure (Azure Communication Services or SendGrid), a verified sending domain, spam/compliance handling (SPF/DKIM, unsubscribe), and recipient management — a whole subsystem with real cost. The ACS SDK is TypeScript, so feasibility is not the blocker; cost and scope are.

## Revisit when

Exporting personalized HTML and sending manually ([email personalization](../../../specs/resource/email-personalization/design.md)) proves too painful for a real use case.

## Cheaper interim

Export personalized HTML and send through any external tool; distribute survey links via esbabbler or copied URLs.
