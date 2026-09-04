# Component folder naming and the Nuxt auto-import name collapse

Read when creating, renaming or moving a component file, when a directory of components gets crowded, or when a tag renders empty with no error. The headline rule — the folder path is the prefix, never repeat it in the filename — is in `SKILL.md`.

Nuxt builds the auto-import name from the directory words plus the filename words: `Feature/Group/ItemCard.vue` → `FeatureGroupItemCard`, `Feature/Group/ItemCardHeader.vue` → `FeatureGroupItemCardHeader`. `Index.vue` contributes nothing, so a folder's own root component is `Group/Index.vue` → `FeatureGroup`.

## Fold a shared prefix into a folder

**Two or more components in one directory whose names start with the same word belong in a folder named for that word** — `FooList.vue` + `FooListItem.vue` + `FooDeleteButton.vue` → `Foo/{List,ListItem,DeleteButton}.vue`. Because the folder re-supplies the word, **the generated component names are unchanged** — a pure move, no template edits.

Fold when either holds:

- the directory is **crowded** (roughly ≥10 flat components) — folding is what keeps it navigable; a 3-file feature folder is already readable and stays flat
- a file sits **beside a folder whose name is its prefix** (`Foo/` + `FooBarBackground.vue`) — always untidy, fold regardless of size. This half needs no judgement, so it is a test: `packages/app/app/components/index.test.ts` fails on the stray and names the folder it belongs in

Two carve-outs:

- **Don't split a suffix family.** `FooCell` + `FooFilterPill` share a prefix, but `FooFilterPill` also belongs to the `Bar`/`Baz` `FilterPill` family. Folding `Foo/` scatters the family — leave it.
- **Don't nest for two.** Once a fold leaves the new folder with a handful of files, stop; `Menu/{Button,LinkList,LinkListItem}.vue` beats a further `Menu/LinkList/{Index,Item}.vue`.

When a fold **is** warranted, the parent of the folded group becomes `Index.vue` in it — `Foo/{List,ListItem,ListHeader,ListFooter}.vue` → `Foo/List/{Index,Item,Header,Footer}.vue`. A bare `List` + `ListItem` pair is the "don't nest for two" case and stays flat.

## Nuxt name compression

**A filename whose leading words repeat the trailing words of its folder path emits that run only once.** `Feature/ItemList/ListItem.vue` → `FeatureItemListItem`, not `FeatureItemListListItem`:

- `Feature/Group/GroupCard.vue` → `FeatureGroupCard` (not `FeatureGroupGroupCard`)
- `Feature/Items/ItemsHeader.vue` → `FeatureItemsHeader` (not `FeatureItemsItemsHeader`)

The collapse is against the folder path's **trailing run**, not just its last word, and it hits any repeat — including a word repeated from a **compound** folder name higher up (`Feature/ThisAndThat/ThatList.vue` → `FeatureThisAndThatList`).

**Rule:** the filename's first word must differ from the last word of its folder path. If they must share one, pick a more specific filename (`GroupDetailCard.vue` over `GroupCard.vue`) — otherwise two files can silently generate one name, and the naive un-collapsed tag resolves to no component and renders **empty with no error**.

This is also the one shape where folding a prefix into a folder **does** change the name: the flat file was collapsing against a word further up the path, and the folder form no longer is (`ThisAndThat/ThatList.vue` → `FeatureThisAndThatList` becomes `ThisAndThat/That/List.vue` → `FeatureThisAndThatThatList`). Update the tags in the same change.

Verify with `typecheck`, which flags an unknown collapsed tag.
