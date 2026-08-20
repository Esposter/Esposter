# Storing Class Instances — `markRaw`

Read when a class instance, command object, controller or third-party object with a live graph is pushed into store state.

Pinia state is **deep**, so a class instance pushed into a reactive array is recursively wrapped in a `Proxy`. Two things break: ECMAScript `#` field access (`this` is the Proxy, so the brand check throws `Cannot read private member #x …`), and devtools traversal, which reads every nested getter and crashes on a lazily-initialised one.

Wrap class instances in `markRaw` at the single point they enter reactive state (`history.value.push(markRaw(command))`). The container stays reactive — its length and identity still drive computeds — and only the instance opts out, which is correct since command and controller instances hold no reactive state of their own. Prefer this to downgrading `#` fields to the TS `private` keyword: keep the strictest ECMAScript form and stop the proxying instead. `shallowRef` is not a substitute where the container relies on in-place `.push()`, which it does not track. Applies to any third-party instance holding a live graph (`vue-phaserjs` skill).
