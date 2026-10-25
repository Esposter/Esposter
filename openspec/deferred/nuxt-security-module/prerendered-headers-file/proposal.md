# Prerendered headers file

## Why

Deferred. The module would write, at build, a headers file for each prerendered page of a static host, so the security headers reach a page the host serves without the server. The two options that named it, `ssg.nitroHeaders` and `ssg.exportToPresets`, were validated and defaulted on but read by nothing, so they were removed rather than built.

## What Changes

Nothing yet: this idea is deferred. Its argument and revisit trigger are in `design.md`. Reviving it moves this folder into `openspec/changes/`.
