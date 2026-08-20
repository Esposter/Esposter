---
title: Global calendar
description: Deferred — a calendar aggregating todos across all of a user's TodoList resources.
---

# Global calendar

A calendar aggregating todos across ALL of a user's TodoList resources — today each list's schedule is its own Calendar blade and nothing spans them.

## Why deferred

It needs a cross-resource content query (read N content blobs or index todo dates server-side) — new mechanism for a page with one known user flow. The per-resource Calendar blade covers viewing one list's schedule.

## Revisit when

Users actually keep multiple TodoList resources and ask to see them in one calendar — then decide between client-side fan-out reads and a server-side date index.

## Cheaper interim

The Calendar blade on each TodoList resource (FullCalendar over that list's items).
