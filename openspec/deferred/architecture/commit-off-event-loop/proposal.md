# Commit off the event loop

## Why

Deferred — running a large save's parse and validation in a worker thread or an Azure Function, so the web server's event loop never waits on it.

## What Changes

Nothing yet: this idea is deferred. Its argument and revisit trigger are in `design.md`. Reviving it moves this folder into `openspec/changes/`.
