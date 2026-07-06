# Platform — Roadmap

Phases 1–4 are shipped (see README). The standards being implemented: `/architecture/datasets.md`, `/architecture/documents.md`, `/architecture/publishing.md`.

## Next — Phase 5: email editor joins the data flow

- [ ] Merge-field blocks (`{{columnName}}`) bound to a `DatasetReference`
- [ ] "Survey invite" block — renders a published survey link + styled button
- [ ] Export personalized HTML per dataset row (sending itself stays deferred)

## Later — polish on shipped layers

- [ ] Dashboard binding form: table-document source picker (provider works; UI currently lists surveys only)
- [ ] `/view/[type]` pages beyond dashboard (webpage is the natural next — GrapesJS HTML render)
- [ ] Published-view OG meta tags for link unfurls
- [ ] Dataset row-cap pagination — only when a real consumer hits the 10 000 cap
