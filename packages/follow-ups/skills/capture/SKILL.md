---
name: capture
description: Apply when a session sees work outside the change in hand that it is leaving undone — the same defect in a sibling file, a page that still describes the old behaviour, a test that only passed by luck. Writes each one into the owner's TodoList as a follow-up the moment it is recognised, through the todoList_addFollowUp tool.
---

# Capture

A follow-up is work this session saw and is leaving undone because it lies outside the change in hand. Each one goes into the owner's TodoList, where a later session drains it (the `drain` skill), instead of being lost in this session's scrollback.

## When to write one

- **Work seen and left undone** because it was outside the change in hand: the same defect in a sibling file, a page that still describes the old behaviour, a test that only passed by luck.
- **Never what this session could finish now.** Where the repository's rules have a finding fixed by the change that finds it, fix it; a follow-up is not a way around that rule.
- **Never what needs a design.** Tell the owner in the reply instead, or, where the repository has a place for designs, such as a proposal, put it there.
- **When found, not at the end.** A session can end at any moment, and one interrupted or compacted before a closing step loses everything held for it. Write each follow-up the moment it is recognised.
- **One todo each**, never several in one todo's notes: a drain completes one follow-up per change.

## Writing it

Call `todoList_addFollowUp` with the values this session's context gives under "Follow-ups" — the list id, the repository and the session id — passed unchanged, and:

- **`name`** — an instruction a cold session can act on: "Guard the missing room id in `readMembers` as `readRoles` does", never "fix the members thing".
- **`notes`** — plain text: the files involved, what done looks like, and anything this session learned that the next one would otherwise rediscover.
- **`dueAt`** — only for a real deadline, since a due date sends the owner a reminder.

The context says when the folder has no repository. Write no follow-up there, since nothing could drain it, and name the work in the reply instead. When the context has no "Follow-ups" section at all, the plugin is not configured: say so once, and name the work in the reply.
