---
title: Comment sort
description: Proposal — a Sort by select above a post's comments offers Hot, Top, New and Old, reusing the feed's sort machinery, so a long thread can be read by what rose, what is newest, or how the conversation began.
model: claude-opus-5-5
---

# Comment Sort

The feed has a **Sort by** select — Hot, New, Top — over the one `post.readPosts` procedure, and comments are read through the same procedure, but they "keep their fixed sort" ([feed and ranking](/docs/post/feed-and-ranking)): always the stored hot score. On a thread of any length that hides the newest reply under older well-liked ones, and there is no way to read a conversation in the order it happened. Reddit puts a comment sort directly above every thread, defaulting to its ranked order and offering Top, New and Old beside it.

## What it adds

A **Sort by** select at the head of the Comments section on `/post/[id]`, the same control the feed's toolbar uses, with four options:

| Option | `sortBy`                            |
| ------ | ----------------------------------- |
| Hot    | `ranking` desc, `id` desc (today's) |
| Top    | `likeCount` desc, `id` desc         |
| New    | `createdAt` desc, `id` desc         |
| Old    | `createdAt` asc, `id` asc           |

- **One map.** `PostSortType` gains `Old`, and `PostSortTypeSortByMap` gains its entry, so the feed and the comments read one mapping. The feed's select keeps showing Hot, New and Top only; Old is a thread order, not a feed order, and the comment select lists all four.
- **The sort applies to the whole tree.** The comment store keeps one slice per parent (`getSliceOperationData(parentId)`); the chosen sort is held once in the store, passed to every branch's `readPosts`, and changing it clears every slice so each open branch reads page one again under the new order — the feed's own "switch clears and refetches" rule, applied per branch. Replies a reader had expanded stay expanded.
- **The cursor already handles every option.** `getCursorWhere` compares compound keys lexicographically in either direction, which is what makes Old's ascending pair page correctly.
- **Per visit, not persisted.** The sort resets to Hot on the next post, as the feed's does.

## What is deliberately not in it

- **No "Best".** Reddit's Best ranks by the Wilson lower bound of the upvote fraction, which needs up and down counts kept apart; our `likeCount` is the net sum. Hot already favours a well-liked early reply, and splitting the counter is a schema change for a sort most readers never open.
- **No Controversial or Q&A.** Controversial needs the same split counts; Q&A needs an author-reply signal the model does not carry.

## Key files

| File                                                       | Role after the change                            |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `apps/web/app/pages/post/[id].vue`                         | the Sort by select at the head of the comments   |
| `apps/web/app/services/post/PostSortTypeSortByMap.ts`      | gains Old                                        |
| `apps/web/app/services/post/PostSortTypeIconMeaningMap.ts` | gains Old's mark                                 |
| `apps/web/app/composables/post/useReadComments.ts`         | reads each branch with the store's sort          |
| `apps/web/app/store/post/comment/index.ts`                 | holds the sort and clears the slices on a change |

## Sources

- [Evan Miller — how not to sort by average rating](https://www.evanmiller.org/how-not-to-sort-by-average-rating.html) — the Wilson lower bound behind Reddit's Best comment sort, and why it needs positive and total counts rather than a net score.
