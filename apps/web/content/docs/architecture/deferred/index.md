---
title: Deferred
description: Cross-cutting standards we chose not to adopt yet — one page per idea with a revisit trigger.
---

# Deferred

Repo-wide mechanisms we deliberately have not adopted. One page per idea with the rationale and a concrete revisit trigger. Standards we decided against outright are in [rejected](/docs/architecture/rejected).

- [Internationalization](/docs/architecture/deferred/i18n) — a translation layer for UI copy, which is hard-coded English today.
- [Error monitoring](/docs/architecture/deferred/error-monitoring) — shipping client and server exceptions to a tracker instead of the console.
- [Bundle budgets](/docs/architecture/deferred/bundle-budgets) — an enforced payload ceiling in CI instead of a manual analyze run.
- [Upload content validation](/docs/architecture/deferred/upload-content-validation) — inspecting an uploaded file's bytes instead of trusting the content type its write SAS was signed with.
