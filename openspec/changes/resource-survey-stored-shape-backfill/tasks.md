# Tasks

Build order. The dry run comes first in each environment, and prod follows dev without waiting for a deploy.

## 1. Dev

- [ ] 1.1 Dry run on dev: print each stored survey whose root props hold `showQuestionNumbers`, and each slider node whose props hold `showValue`, with the count per store.
      Verify: the output lists each document and slot, and a non-boolean value is reported rather than rewritten.
- [ ] 1.2 Write on dev, then re-run until the run reports nothing to change.
      Verify: the final run reports zero documents to change, and a survey saved mid-run is retried rather than overwritten.

## 2. Prod

- [ ] 2.1 Dry run on prod, then write, straight after 1.2.
      Verify: the dry-run count equals the prod count the write reports, and the re-run reports nothing to change.
- [ ] 2.2 Delete the scratchpad script and report the counts per store and environment.
      Verify: the repository tree holds no trace of the script, and this change is archived.
