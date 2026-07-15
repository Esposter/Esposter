---
title: Mock Table Ordering Fidelity
description: MockTableClient.listEntities returns insertion order where real Azure returns partitionKey + rowKey order — and five messaging tests appear to encode the mock's behaviour rather than production's.
---

# Mock Table Ordering Fidelity

Azure Table Storage returns entities ordered by `partitionKey` then `rowKey`. `MockTableClient.listEntities` returns them in insertion order. Every test that reads a range therefore asserts against an ordering production does not have.

This matters more here than in most codebases: messages use `rowKey = reverseTickedTimestamp` precisely so that Azure's `rowKey` ordering yields newest-first. The mock never reproduces the mechanism the design depends on.

## What was found

While implementing the resource storage features, an agent corrected `MockTableClient.listEntities` to sort by `partitionKey` + `rowKey`. That broke **five message-router tests**, which assert a descending cursor read returns _oldest_-first. Those assertions pass only against insertion order — meaning they encode the mock's behaviour, not Azure's. The fix was reverted rather than rewrite messaging tests inside an unrelated resource PR.

So one of two things is true, and nobody has yet established which:

1. The messaging read path is correct and the five tests are wrong — they were written against the mock and would fail against real Azure.
2. The messaging read path has a real ordering bug that the mock has been hiding since it was written.

**Resolve that question before touching either side.** The cheapest resolution is to point the five cases at a real Azure Table (or Azurite) and see which way they fall.

## Why it was not fixed in place

The correction is one sort in `azure-mock`, but its blast radius is every `listEntities` consumer's tests. It needs to be its own change, with the messaging assertions re-derived from production semantics rather than adjusted until green — adjusting them to match a newly-sorted mock would re-encode the same class of error in the other direction.

## Related

`packages/azure-mock` is a published, generic package — the fix belongs there, not in an app-side shim. See the note in `MockTableClient` on `byPage()`: a bare `for await` over `listEntities` loops forever because `next()` restarts the generator, which is why the codebase always paginates. That is a second fidelity gap in the same class.

## Checklist

- [ ] Determine ground truth: run the five message-router cases against Azurite / real Azure Table
- [ ] If the read path is buggy, fix it and keep the tests; if the tests are wrong, re-derive them from Azure semantics
- [ ] Sort `MockTableClient.listEntities` by `partitionKey` + `rowKey`
- [ ] Fix the `for await` / `next()` generator-restart gap, or document it on the client
- [ ] Sweep other `listEntities` consumers' tests for order assumptions
