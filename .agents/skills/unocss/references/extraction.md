# What the Extractor Reads

Read when a layout is wrong in dev and right after a reload, a `.ts` file names a utility, or a template comment seems to break an attribute.

## Every template scanned at startup

`content.filesystem` reads every `.vue` under the Vite root (`app/`, which Nuxt sets as `srcDir`) once at dev startup, and every `.ts` there carrying `@unocss-include` — the glob names `.ts` too, and the pipeline filter drops the rest. Without it the dev stylesheet holds only the utilities of the modules transformed so far, so a page first reached by client navigation, or a component behind `<ClientOnly>`, renders unstyled until a reload — padding, gaps and max widths missing while scoped styles apply, or a menu item whose icon only a composable names drawn without it. A layout that is wrong in dev and right after a reload is this, never a CSS bug; the scan stays even though a production build already sees the whole graph.

## A template comment says anything

Attributify's extractor reads `<!-- ` as the start of a tag, so an apostrophe in a template comment used to open a quote that ran to the next one in the file and swallowed every attribute between — the app shell's dock padding generated nothing that way. `uno.config.ts` hands attributify each file with its comments blanked to spaces (`uno.config.test.ts` holds it), so a comment is written as prose and never reworded around the extractor.
