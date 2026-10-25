# AI-assisted features for the page builder

## Why

The webpage and email editors both run on the page builder now, so an owner building a page or an email can meet a set of AI-assisted features: a critique of what is wrong with the document, alt text for an image, a rewrite or translation of a block, a page started from a sentence, and a pasted design turned into blocks.

Each of these is a model task except the critique, and Esposter runs no model. A feature that calls a model from Esposter's own server is a metered feature, and the house rule is that a metered feature is a rejection, not a gate: a Claude feature is free to the person beyond the plan their Claude Code already runs on. So the free route to every model task is the person's own session, through the in-product assistant that is already designed in [the in-product assistant](../../specs/architecture/ai-native-resources/in-product-assistant/design.md). That assistant waits on a host the page can pair with, and the model-backed candidates below all run through it.

One candidate needs no model at all: a critique pass of deterministic checks over the document. It is the only candidate that can ship now, and it is the first thing an assistant would read to decide what to fix. So this proposal recommends it first.

## Candidates, ranked

Ranked by what the owner gains against what each costs and risks. The model cost, the data a model would see and the prompt-injection exposure are the three columns that decide whether a candidate is free to run.

| Rank | Candidate                                                                                                                          | Runs where                                                      | Model call                 | Free as proposed           | Fit with the generic resource tools                                  | Verdict                                                                       |
| :--- | :--------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- | :------------------------- | :------------------------- | :------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| 1    | Critique pass: contrast, fixed widths and survey invite targets for a webpage, then merge fields and compile messages for an email | the browser over the open document, and the server for an agent | none                       | yes, no model              | one generic read tool, each type's checks declared in its definition | recommended, shipped first                                                    |
| 2    | Alt text suggestions for an image                                                                                                  | the person's session                                            | a vision call on the image | yes, through the assistant | one write to the image's alt at its pointer                          | after the assistant lands                                                     |
| 3    | Rewrite or translate a selected block                                                                                              | the person's session                                            | a text call                | yes, through the assistant | one replace at the block's pointer                                   | after the assistant lands, once the text node's attributes are described      |
| 4    | Generate a page or email from a prompt                                                                                             | the person's session                                            | a text call                | yes, through the assistant | the lifecycle create tool, then content writes                       | stays deferred; the assistant serves it once it lands                         |
| 5    | Convert a pasted design or HTML into blocks                                                                                        | the person's session                                            | a text call                | yes, through the assistant | a whole-tree patch                                                   | not recommended: the page builder program already decided against HTML import |

The sixth row is the in-product assistant itself, which hands any of rows 2 to 4 to the person's session. It is designed already, so this proposal extends it with the page builder's requirements rather than duplicating it.

## Per-candidate reading

**1. Critique pass.** The value is that an owner, and an agent acting for one, can find accessibility and layout faults before publishing, instead of after a reader meets them. The cost is compute bounded by the node limits the editors already enforce (`MAX_WEBPAGE_NODES` and `MAX_EMAIL_NODES`), with no model and no data leaving Esposter. It cannot run injected instructions because it reads the document as data. It runs in the browser for the open, unsaved document and on the server for an agent reading the saved one, so it is one pure function with both callers. Its checks are partial by design: what it cannot read it reports as unchecked, never as passing.

**2. Alt text.** The image field already refuses an image with no alt text unless it is marked decorative, so the gap is quality, not presence. An assistant suggesting alt text needs the image bytes, which go to the person's own session, and an image the person uploaded is theirs to send. The write is one replace at the image node's alt pointer, and the schema validates it. Doing this server-side would be a metered vision call, so it is rejected in that form.

**3. Rewrite and translate.** The value is real for multilingual pages, and the cost is a text call through the person's session. The risk is structural: a text node holds ProseMirror JSON, and the agent surface does not describe a rich text document's node attributes (the node attributes of a Note document are undescribed in the agent content tools design, at the path the Note's document writes its attributes under). A rewrite that touches a link or a heading level would be refused until those attributes are described, so this candidate waits on that gap.

**4. Generation from a prompt.** The deferred [AI resource generation](../../deferred/resource/ai-resource-generation/design.md) page imagined a server-side model writing a schema-validated document, and was deferred for want of a platform decision. The free form of the same idea is an agent in the person's own session writing through the generic tools: the lifecycle create tool, then the content door, each write validated against the type's schema. It adds no new mechanism, so it stays deferred on its own trigger and the assistant serves it when that trigger is taken. Publishing is not part of it: an agent does not publish.

**5. Pasted design or HTML.** The page builder program lists HTML and CSS import among the things deliberately not in it: a typed tree cannot hold arbitrary HTML faithfully, and an importer either wraps the markup in raw nodes or maps it by guesswork. A model-written mapping has the same loss, and pasted markup is the largest prompt-injection surface in the candidates, since pasted text can carry instructions to the session. The one sound form is an assistant that places unmapped parts in sanitised Custom HTML nodes. That reopens the program's decision, so it is not recommended here.

## Notes on cost, data and injection

- **Hosted model calls are rejected.** Any of rows 2 to 5 run server-side would bill Esposter for a model call, which the free rule forbids. The bounded alternative is the one already named: the person's session, on the subscription they already have.
- **Hosted sessions are not offered for these features.** The [hosted sessions](../infra-agent-console-anthropic-hosted-sessions/proposal.md) change bills the reader's own API key, which is metered to them, so it is not the free path these features use.
- **Data to a model.** Rows 2 to 5 send the document and its images to the person's session. An email's bound dataset holds recipients' rows, and a session reading a Sheet would send them too. The critique sends nothing anywhere, so this is a risk the assistant rows must state when they are designed.
- **Prompt injection.** Text in a document, and especially pasted text, can carry instructions to a session. The defence the assistant rows rely on is the one the content tools already have: a key scoped to the Resources scope, every write validated against the type's schema and reversible through its inverse operations.

## Recommendation

Ship candidate 1, the critique pass, first, as this change. It is the only candidate with no model, no metered call and no dependency on the assistant, and it gives the assistant something to act on. Then extend the in-product assistant's change with the page builder's requirements for rows 2 to 4: pointer-scoped prompts from a selection, the alt text rule, and the rich text attribute gap.

## Open choices

These affect other changes' designs, not this change's specs or tasks, so they are listed for their owners.

- **Whether an agent may publish.** The lifecycle tools design owns this. Recommended: no, since publishing is the owner's act and is visible to readers.
- **Whether an assistant's edit enters the undo stack.** The live edits design owns this. Recommended: yes, as one history entry carrying the inverse operations, so a single undo reverts it.
- **The email compatibility rules.** The email's compatibility checks would need a list of what email clients drop, which is data, so they need an upstream feed chosen and read before adoption. They belong to the email change, not this one.
- **Reachability of external links.** Checking that an external link responds means the server fetching an address a page names, which is the server-side request risk the rejected URL import page records. It is a separate proposal with its own design.
- **Reopening the HTML import non-goal.** Owner decision. Not recommended.

## What Changes

This change ships the critique pass for webpages, and nothing else.

- A pure critique over the webpage document: text whose contrast is under 4.5 to 1 against its effective background, a fixed width wider than the narrowest device the canvas draws, and a survey invite to an unpublished survey. Any colour the critique cannot read is reported as unchecked.
- A Check panel beside the webpage editor's Content, Style and Theme panels that lists the open document's findings live, and selects a finding's node on the canvas.
- A generic read tool that answers the critique of a saved resource to an agent under the Resources scope. A type with no critique is refused, naming the type.
- The email checks follow in the email change once it lands, so this change waits on nothing.

## Capabilities

- **resource/page-builder/critique** (new)

## Impact

- The page builder's shared services, which hold the critique function and its checks.
- The resource definition, which gains an optional critique per type, and the generic resource router, which gains the read tool.
- The MCP tool listing, which gains the tool under the Resources scope.
- The webpage editor's panel tabs.
- No new dependency: the browser reads each colour through a probe element, and a colour it cannot compute is reported as unchecked.
- The page builder README and the page builder skill, which list the new capability.
