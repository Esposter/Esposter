---
title: Todo smart lists
description: Deferred — My Day, Important and Planned views spanning every TodoList are a cross-resource content query, the same one the global calendar is deferred on.
---

# Todo Smart Lists

Microsoft To Do's sidebar opens on smart lists that gather tasks from every list: **My Day** (tasks picked for today), **Important** (every starred task) and **Planned** (every dated task, grouped by when). They are the feature most people name when they describe To Do.

## Why deferred

Each TodoList is its own resource with its own content blob ([resources](/docs/architecture/resource)). A view across all of them means reading and parsing every TodoList blob the user owns on each open, or keeping an index of items outside the blobs — the same cross-resource content query the [global calendar](/docs/resource/deferred/global-calendar) is deferred on, and a second source of truth the [resource references](/docs/resource/deferred/resource-references) page already argues against. Within one list, the Calendar blade already answers "what is planned", and the proposed [importance](/docs/proposals/resource/todo-list/importance) sort would answer "what is important".

My Day adds a per-day selection that expires at midnight — state that belongs to no single list and would need a home of its own.

## Revisit when

A user keeps more than a handful of TodoLists and asks for one view across them, or the global calendar is built — whichever ships the cross-resource read first, the other rides it.
