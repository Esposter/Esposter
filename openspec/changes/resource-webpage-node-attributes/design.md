## Context

A webpage button renders a link with its address and its label, and has no target. The attribute names the render writes are one set of constants, and that set holds the id and the title but not the target or the relationship. Every webpage node already carries a node id, which the document minted and which names the node's class in the published stylesheet, so it cannot be the id a fragment link reaches. The webpage document's save check already refuses two nodes with one node id, and the address check already accepts a relative address with no scheme, so a link to a fragment is a valid address. The email's button holds a target and a relationship as MJML attributes, so the email side has the grammar already.

## Gap analysis

| Feature                                   | Verdict                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Button target (new tab) and rel [webpage] | Built here: the button's new-tab choice, and the relationship a new-tab link always carries       |
| Element id attribute [webpage]            | Built here: an element id on every webpage node, with the save refusing an invalid or repeated id |

## Decisions

- **The target is one of two choices.** Same tab and new tab are the choices an author needs, and a named target opens into a browsing context the reader may already have open. Rejected: a free target name, which would accept a window name a reader can open into.
- **A new-tab link always carries the safe relationship, and the author sets none.** The new page can reach back to the page that opened it unless the link carries that relationship, so the render adds it to every new-tab link. Nothing in the button's form lets an author set a relationship of their own, so there is none to keep. Rejected: an editable relationship field, which no one has asked for and which would be a second way to drop the safe one.
- **The element id is its own prop, apart from the node id.** The node id is minted, names the node's class, and renaming it would break the node's styles. Rejected: using the node id as the element id, for that reason.
- **An element id takes the rule a node id already takes.** The node schema's id check reads `MAX_NODE_ID_LENGTH` and `NODE_ID_REGEX` from `constants.ts`, and the element id reads the same two, so the two rules cannot drift apart. The HTML rule admits every character but whitespace, and a hash or a question mark in an id is one a fragment link cannot reach, so the author's link would silently miss it. Rejected: the HTML rule's character set, for that reason.
- **A repeated element id is refused on save.** A fragment link goes to the first element with that id, so a second element is unreachable and the author would not see why. Rejected: renaming the second element silently, which sends a link to the wrong element with no message. The save refusal is the one the document already gives a repeated node id.
- **A stored node with no element id fails its parse until a backfill writes one.** The element id is a string whose empty value is its absence, and the schema declares it required with no default, so a page saved before this change is brought to the new shape once by the `backfills` skill's throwaway script, run on dev and then on prod. Rejected: a default that lets an old page parse, which the repository does not keep beside the new shape.

## Rejected

- Element id as a Content panel field only, without a publish rule. The panel edits the prop, but the publish is where a reader's link lands, so the rule belongs in the document.
- A title on every node. The HTML `title` attribute is a weak tooltip: MDN says its use is highly problematic for people navigating with keyboards, people using touch-only devices and people using assistive technology such as screen readers, and its browser support is inconsistent. A video keeps the required title it already stores, which this change does not touch.

## Risks and trade-offs

- A fragment link to an element id that does not exist is not refused. The author sees a link that does nothing, and the critique does not check it. That is recorded under Not built.

## Not built

- A check that a fragment link names an element id the page holds. The critique reports the links it can read from the document, and a fragment check is a separate rule over the page's ids.

## Key files

| File                                                            | Role                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `apps/web/shared/services/pageBuilder/buttonNodeType.ts`        | the button's form and props, which gain the new-tab choice and the relationship its render writes         |
| `apps/web/shared/models/pageBuilder/HtmlAttributeName.ts`       | the attribute names the render writes, which gain the target and the relationship beside the id and title |
| `apps/web/shared/services/pageBuilder/renderWebpageDocument.ts` | the render of a webpage document, which writes each node's element id onto its element                    |
| `apps/web/shared/services/pageBuilder/webpageDocumentSchema.ts` | the document schema, which gains the save refusal for an invalid or repeated element id                   |
| `apps/web/shared/services/pageBuilder/nodeTextSchema.ts`        | the bound a node's text and a video's title are held to                                                   |
| `apps/web/shared/services/pageBuilder/webpageNodeSchema.ts`     | the node schema, whose node id check the element id reuses                                                |
| `apps/web/shared/services/pageBuilder/constants.ts`             | the node id bound and pattern the element id reuses, and the text bound a video's title is held to        |
| `apps/web/shared/services/pageBuilder/webpageNodeChildren.ts`   | the children port, which the id-uniqueness walk reads each node's children through                        |
| `apps/web/app/components/PageBuilder/ContentPanel.vue`          | the Content panel that draws each node's form, which gains the new-tab choice and the element id field    |

## Sources

- [Webflow University — Element settings panel](https://university.webflow.com/glossary/element-settings-panel) — the Element settings panel configures element-specific details, the element ID among them, which the element id field follows.
- [Webflow — Set Link Settings, Designer API](https://developers.webflow.com/designer/reference/link-element/setSettings) — its `openInNewTab` option, described as "Choose to open the link in a new tab", which the button's new-tab choice mirrors.
- [MDN — title, global attribute, "Accessibility concerns"](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title) — the `title` attribute's use is highly problematic for keyboard and touch-only users and for screen reader users, which is why a title on every node is rejected.
