# Note Workspace Nesting

In Notion, a page is also a container: it holds sub-pages that nest to any depth, and inline databases whose rows are pages in their own right. The idea was to let a Note do the same, holding child Notes and a table-with-views inside its text.

## Why not

Every resource already lives in one hierarchy, the [explorer](../../../specs/resource/explorer/design.md), with its trail, search, tags, favourites and recycle bin. A Note that held child Notes would be a second tree of resources, invisible to all of those and reachable only by opening its parent. An inline database is the [Sheet](../../../specs/resource/sheet-resource/design.md) for the same reason: typed columns, filters, sorts and views are what the Sheet editor is, and a copy inside a Note would split one kind of data across two editors.

What a document needs from either is covered without them: a link to another resource's page from Note text, and a [simple table](../../../specs/resource/note-resource/design.md) for plain rows of text.
