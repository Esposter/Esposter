# Unauthenticated Local Resources

Editing resources without an account, through a localStorage persistence path.

## Why not

The premise is gone. The resource explorer pages carry the auth middleware, so every resource is edited with an account. The resource store's localStorage use holds only list columns, search history and the todo sort, none of which is a resource save, so no second save path exists to double. Reopened when anonymous trial-before-login becomes an explicit product goal, and then it is designed deliberately, as a demo resource seeded on signup or a scoped localStorage draft that imports on login, rather than as a parallel save path.
