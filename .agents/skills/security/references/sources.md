# Sources

Read when a risk has no owner in `references/owasp-top-10.md`, when a defence is being designed, or when a sweep unit raises a question the checklist does not ask. These are the pages to read before writing a rule. Cite the one read in the commit or the docs page that ships the rule, as the `docs` skill's sources convention asks of any design. Each entry says what to take from it for this repo.

## The lists

- OWASP Top 10:2025 — https://top10.owasp.org/2025/ — the checklist's spine. Each category page has its own prevention list:
  - https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/
  - https://top10.owasp.org/2025/A02_2025-Security_Misconfiguration/
  - https://top10.owasp.org/2025/A03_2025-Software_Supply_Chain_Failures/
  - https://top10.owasp.org/2025/A04_2025-Cryptographic_Failures/
  - https://top10.owasp.org/2025/A05_2025-Injection/
  - https://top10.owasp.org/2025/A06_2025-Insecure_Design/
  - https://top10.owasp.org/2025/A07_2025-Authentication_Failures/
  - https://top10.owasp.org/2025/A08_2025-Software_or_Data_Integrity_Failures/
  - https://top10.owasp.org/2025/A09_2025-Security_Logging_and_Alerting_Failures/
  - https://top10.owasp.org/2025/A10_2025-Mishandling_of_Exceptional_Conditions/
- OWASP API Security Top 10 (2023) — https://api-security.owasp.org/editions/2023/en/0x11-t10/ — tRPC is an API. Object-level and property-level authorization, and unrestricted resource consumption, are the entries a procedure hits most.
- OWASP ASVS 5.0 — https://owasp.org/www-project-application-security-verification-standard — the requirement-level checklist to read when a whole subsystem (auth, uploads, sessions) is being designed rather than reviewed.
- OWASP Top 10 CI/CD Security Risks — https://owasp.org/www-project-top-10-ci-cd-security-risks — for `.github/`, the collector and Renovate.
- OWASP Top 10 for LLM Applications — https://genai.owasp.org/llm-top-10/ — for the agent console and anything that hands text to a model with tools.
- CWE Top 25 — https://cwe.mitre.org/top25/ — the weakness ids a finding can cite.

## OWASP cheat sheets

The index is https://cheatsheetseries.owasp.org/Glossary.html. These are the pages this stack reaches:

- Access and identity:
  - https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html — rooms and owned resources are tenants
  - https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- Input and output:
  - https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html — an input schema that spreads into an update
  - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html — what a sanitizer allowlist must survive
  - https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html — `packages/xml2js`
  - https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
- Files and fetches:
  - https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html — read before any server fetch of a user's url
- Browser hardening:
  - https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/XS_Leaks_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html
- Realtime:
  - https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html — Web PubSub, the agent console socket
- Abuse and availability:
  - https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Bot_Management_and_Anti-Automation_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html
- Secrets, logging and errors:
  - https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
- Runtime and platform:
  - https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Serverless_FaaS_Security_Cheat_Sheet.html — `apps/functions`
  - https://cheatsheetseries.owasp.org/cheatsheets/Secure_Cloud_Architecture_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html — `apps/infra`
- Supply chain and CI:
  - https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/GitHub_Actions_Security_Cheat_Sheet.html
- AI and agents:
  - https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html — the agent console
  - https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html — code this repo's sessions write
- Method:
  - https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html
  - https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html — how a sweep unit is read
  - https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html

## Vendor guides for this stack

- nuxt-security — https://nuxt-security.vercel.app/ — the module behind the CSP and headers.
- tRPC authorization — https://trpc.io/docs/server/authorization — middleware-based authorization, the pattern the procedure builders follow.
- better-auth session management — https://www.better-auth.com/docs/concepts/session-management — cookie sessions and their expiry.
- Drizzle `sql` operator — https://orm.drizzle.team/docs/sql — which interpolations parameterize and what `sql.raw` does not.
- Azure Storage SAS overview — https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview — scope, expiry and revocation of the upload and read grants.
- Azure security best practices — https://learn.microsoft.com/en-us/azure/security/fundamentals/best-practices-and-patterns
- GitHub Actions security hardening — https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- GitHub Security Lab, preventing pwn requests — https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/ — `pull_request_target` and untrusted checkouts.

## Learning references

- MDN web security — https://developer.mozilla.org/en-US/docs/Web/Security
- web.dev, strict CSP — https://web.dev/articles/strict-csp — the nonce-based policy to compare the current allowlist CSP against.
- PortSwigger Web Security Academy — https://portswigger.net/web-security/all-topics — worked attacks for each class, useful when judging whether a finding is exploitable.
