# Concept Words

Read when naming a sibling of an existing type, guard or constant for a concept the prose calls by a shorter word.

A subsystem often keeps two settled words for one concept on purpose: a short one for prose and a longer one for
identifiers — the persona plugin's spoken language is a **dub** in every comment and doc and a `VoiceLanguage` in
every type, guard and path. **A sibling takes the identifier word, never the prose one.** Naming the second reader
"readDub" beside `checkIsVoiceLanguage` invents a third spelling, and nothing catches it: a grep for the concept
stops finding half its call sites while the typecheck stays green. Grep the existing type, guard and constant for
the concept and match them exactly; the prose keeps its short word in comments, docs and user-facing strings.
