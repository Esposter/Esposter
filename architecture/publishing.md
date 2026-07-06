# Publishing

The standard for making anything publicly shareable: a versioned publish copy plus a public, rate-limited, read-only route. Whenever a product needs "share this with people who aren't logged in", it uses this mechanism — never ad-hoc public reads of working data.

The surveyer proved it: `publishSurvey` bumps `publishVersion`, clones the model blob into a publish directory, and `pages/survey/[id].vue` serves the clone publicly without auth. The document publishing procedures generalize the same mechanism.

---

## Mechanism

- **Publish = snapshot copy.** `publishDocument` copies the content blob to `${id}/published/${publishVersion}`, bumps `publishVersion`, sets `publishedAt`. Edits after publish are invisible until re-publish — that is the feature (a stable public artifact), not a limitation.
- **Public reads serve only the publish copy**, never the working copy, and are rate-limited with no auth — exactly like the survey response page.
- **Unpublish** deletes the publish blobs and clears `publishedAt`; the public URL 404s.

| Procedure                      | Auth                 | Purpose                      |
| ------------------------------ | -------------------- | ---------------------------- |
| `publishDocument`              | owner                | snapshot copy + version bump |
| `readPublishedDocumentContent` | public, rate-limited | serve the publish copy       |

## Routes

`pages/view/[type]/[id].vue` — public read-only renderer, one lightweight view component per `DocumentType`. A published URL is the share unit everywhere: paste it in an esbabbler message, a post, or externally. The page's OG meta tags give free unfurls on external platforms.

## Live Data In Published Documents

A published dashboard may contain visuals bound to datasets. Resolution runs with the **owner's** authority — publishing deliberately exposes that data. Safety rule: per-visual "include live data" opt-in, default **off** (the visual publishes a static snapshot taken at publish time).
