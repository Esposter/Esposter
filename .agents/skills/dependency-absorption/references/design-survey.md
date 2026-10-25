# Design Survey For A UI-Bearing Absorption

Read when an absorption replaces a package whose output is an interface a person sees: an editor, a builder, a form engine, a chart, a table, a calendar. A package that only computes something does not owe this. The rule that makes it owed is the skill's; this page is how it is run.

## Why it is owed

A replacement written from the package's API reproduces its functions and none of its arrangement, so the surface reads as the parts it is made of. The arrangement is the part a reader judges, and it is the part an absorption drops first when nothing is looked up before the first template. The survey is that lookup, done once and written where the next person who touches the surface finds it.

## What the survey reads

Consult these in the order the design-sources page gives (`openspec/specs/architecture/design-sources/design.md`, "The order they are consulted in"):

1. **The package's own reference product.** The product the package is modelled on: its demo, its shipped examples, the screenshots in its docs. Match its hierarchy: what is large, what recedes, what sits in the margin.
2. **The galleries for its category.** The list under "Galleries of shipped screens" in the design-sources page. A gallery the survey finds that the list lacks is added to it in the same change.
3. **The design language.** `openspec/specs/architecture/design-language/design.md` gives the tokens the surface is drawn in. The survey settles arrangement and density; the language settles the look.

Stop when the arrangement is settled. A source that adds nothing is recorded as consulted with nothing taken from it, which is a result.

## What is recorded

The replacement's own design page gets a **Design sources** section with one line per source consulted: what it is, and what it gave the surface. A departure from every source says how it is better and which source it departs from. That section is where the next person who rewrites the surface learns why it looks as it does.

## What it does not replace

The design pass in the `ui-library` skill (`references/design-pass.md`) still runs before the unit is handed over, and the eye check still confirms the result. The survey decides the arrangement before code exists; it does not sign the finished surface off.
