# Call state reconciliation

## Why

Rebuilding the call maps after a restart, so a call that outlives a deploy keeps working.

## What Changes

Rebuild the maps from RealtimeKit's participant list, or close every room on boot so its clients rejoin. Why neither is needed is in `design.md`.
