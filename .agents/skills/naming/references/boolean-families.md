# Boolean Families

Read when two boolean spellings both look right — a predicate function against a stored flag, or `isPending`
against `isLoading`.

The prefix roster itself is in `SKILL.md`; this page separates the two families that collide.

## `check*` vs `is*` vs `getIs*`

`is*` is a stored boolean; `check*` is a call that returns one. That is what makes callability unambiguous —
`checkIsManageable(...)` is always a call, `isManageable` is always a value.

**`getIs*` is not an alternative spelling of `check*`.** A boolean is a derivation, so `get*` reads as if it also
applied, and the family grew to twenty-odd names before anyone noticed. It does not apply: `check*` wins for
anything whose call returns a boolean, whatever produces it.

`get*` survives only where the call returns a **function** — a comparator, a middleware factory — and there the
`Is` in the name is the part that is wrong, not the prefix.

One name can be both a field and a predicate parameter, and only the call moves —
`references/names-a-dependency-owns.md` ("One name can be two identifiers").

## `isPending` vs `isLoading`

**`isPending` is a request's in-flight state**, and it keeps that name all the way to the prop that renders it.
The primitives return it (`useMutation`, `useCachedRead`, the pagination composables) and so does the library
beneath them (`authClient.useSession()`), so a consumer binds `:is-pending` with nothing renamed in between.

**`isLoading` is for a wait that is not one request** — a local `ref` covering a parse, a mount, or several calls
a surface treats as one (`StyledWaypoint`, a sheet's first render).

An alias between them (`isPending: isLoading`) means one of the two names is wrong: pick the one that describes
what is actually being waited on.

Per-operation flags follow `pinia`'s `is{Operation}Pending`. **A local flag naming its verb — `isAdmitting`,
`isDismissing`, `isCreating` — is `isPending` wherever the surface has only one action that can be in flight.**
The verb earns its place only when there is more than one, so the name says which is pending: a knocker row that
admits and dismisses cannot tell the two apart with a single `isPending`. One action, one flag, and it is
`isPending` like everything else.
