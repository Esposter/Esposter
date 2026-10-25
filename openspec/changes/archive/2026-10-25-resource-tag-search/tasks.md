# Tasks

## 1. Predicate

- [x] 1.1 Add the tag arm to the search predicate: a case-insensitive substring over each tag's name and value, the query escaped. Verify: a test named after the scenario 'A tag value finds its resource' is written first and seen failing, then passes; a test named 'A tag name finds its resource' passes beside it.
- [x] 1.2 Give the count the same predicate, so the count includes a tag match. Verify: a test named after the scenario 'A tag match is counted with the list' fails before the arm exists and passes after it.
- [x] 1.3 Keep See all results on the same predicate, so its list includes the tag match. Verify: a test named after the scenario 'See all lists a tag match'.

## 2. Ordering

- [x] 2.1 Lead the ordering with the name match, so a tag-only match sorts below every name match, ahead of the trigram key that cannot promise it (design.md, "The name match is the first key"). Verify: a test named after the scenario 'A name match ranks above a tag-only match' fails without the key and passes with it.
- [x] 2.2 Bind the query's wildcard characters as literal text in the tag arm too. Verify: a test named after the scenario 'A wildcard in the query matches only itself'.
