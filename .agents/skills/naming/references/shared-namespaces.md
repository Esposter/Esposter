# Shared Namespaces

Read when choosing a value that lives outside the repository's own code — a URL scheme, an environment variable, a registry key, a folder under the user's app data, a process or window title, a cookie or storage key on a shared origin.

## The rule

**An identifier is generic; a value in a namespace the machine shares carries the product's prefix.** The code names the concept (`HOST_SCHEME`, `SESSION_SECRET_ENVIRONMENT_VARIABLE`) and never the product. The value that constant holds names the product (`esposter-host`, `ESPOSTER_SESSION_SECRET`) whenever other programs write into the same space. The prefix is not branding. It is what keeps two programs from claiming one name.

A value needs the prefix when the namespace it lives in is shared:

| Namespace                                     | Why a generic value breaks                                                                                                                                                                                 |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL scheme (`HKCU\Software\Classes\<scheme>`) | One key per scheme for every app on the machine. `host://` overwrites another app's handler on install, and whichever app registers it last receives the page's links — one of them could be a hostile one |
| Environment variable a child process inherits | The environment reaches Claude Code and every tool it runs. `SESSION_SECRET` is a common web-app variable: the reader's own value is read as ours, and deleting ours deletes theirs                        |
| Folder under `%LOCALAPPDATA%` or `~`          | `Host` or `.agent` collides with any other program's folder, and an uninstall removes files that were never ours                                                                                           |
| Process or window title                       | The reader tells windows apart by it; `session` says nothing about whose                                                                                                                                   |

A value that lives only inside something the repo owns — an enum member's value on its own wire, a column name, a query key on its own route — takes no prefix, since nothing else writes there. **Neither does text shown inside our own surface.** A message printed in the host's window or shown on the page is already ours, so it says _Could not start the host_, never _Could not start the Esposter host_. The product name appears only where the reader chooses among other programs' names: the browser's _Open Esposter Host?_ prompt, which shows the scheme's registered name, and a window title in the taskbar.

## How to apply

`naming/no-site-name-literal` reports any string that spells the name out, except a workspace package (`@esposter/…`), a web address, and the repository's `Esposter/Esposter`. It is off in `apps/infra`, where an Azure resource keeps the name the portal shows it by. A site that genuinely cannot reach `SITE_NAME` — a package shipped without `@esposter/shared`, or the root config — takes a disable that says so.

- Name the constant generically, and let its value carry the prefix. Nothing at a call site ever reads the prefix.
- **Derive the prefix from `SITE_NAME`** (`@esposter/shared`), never retype it, in each namespace's own casing: `` `${SITE_NAME.toLowerCase()}-host` `` for a scheme, `` `${SITE_NAME.toUpperCase()}_SESSION_SECRET` `` for an environment variable, `SITE_NAME` itself for a folder or a displayed name. `SITE_NAME` holds the display spelling, since that is the one form the others can all be derived from.
- Keep a value that already exists in the wild — a scheme users have registered, a folder that holds installs — rather than renaming it. A rename there is a migration, not a naming fix.
