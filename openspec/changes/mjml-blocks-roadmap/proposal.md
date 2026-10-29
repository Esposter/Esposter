# mjml-blocks roadmap

## Why

`mjml-blocks` is a package with no bench setup. Its one speed claim, that a long run of unclosed tags reads in linear time, was guarded by a timing assertion that was removed for flaking on loaded hosts. The commit that removed it said speed belongs in a committed bench, but no bench was added, so nothing measures that claim now.

## What changes

This roadmap records the open item. Its tasks are the package's bench setup and the bench for the unclosed-tag read, to be decided and built as one change.
