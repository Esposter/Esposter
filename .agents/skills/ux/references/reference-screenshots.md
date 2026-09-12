# A Screenshot of the Reference Product Is the Specification

Read when someone hands over a screenshot of Discord or Slack doing the thing. The rule itself is in `SKILL.md` — follow the reference product where the domain matches; this page is what a handed-over frame commits the build to.

When someone hands over a screenshot of Discord or Slack doing the thing, it is not an illustration of the general
idea — it is the spec, and it is being handed over precisely because reading it is cheaper than describing it.

- **Take the strings verbatim.** Every label, heading, empty state and helper line, down to the punctuation.
  Substitute only the domain noun (`server` → `room`, `channel` → `room`), and only where leaving it would be
  wrong.
- **Build what is in the frame and nothing else.** No extra entry point, no extra button, no second explanatory
  line of our own. An invented control is a deviation, and a deviation has to be _better_ and said out loud — an
  addition nobody asked for is neither, and it is the first thing that gets deleted by the next reader comparing
  the two.
- **A control we cannot back yet is left out, not mocked.** A button whose write does not exist is worse than a
  missing one, and it fails the rule above about a surface whose actions can succeed.
- **A string that would be false here is a missing feature, not a wording problem.** Discord's `revoke any one`
  says its panel can revoke. Either that ships or the line is adapted to what ours does — it is never quietly
  rewritten into our own voice while the arrangement claims to be theirs.
