## 1. Interface host for external tools

- [ ] 1.1 Carry an app's interface read to the page, and the host's answer back. Verify: a test named after the scenario 'An app appears under its tool call' written first and seen failing.
- [ ] 1.2 Record the sandbox proxy's own origin in the design's Notes once the proxy is built, the origin the frame in 1.3 loads from. The design leaves it open, with a second loopback port on the host as its candidate. Verify: the Notes name that origin, and the test named after the scenario 'An app cannot read the console's storage' passes from it.
- [ ] 1.3 Build the sandboxed frame with its proxy, and accept messages only from the frame created. Verify: tests named after the scenarios 'An app cannot read the console's storage' and 'Messages from another frame are ignored' written first and seen failing.
- [ ] 1.4 Route an app's tool calls through the permission card. Verify: tests named after the scenarios 'An app's tool call asks permission' and 'A denied app call does not run' written first and seen failing.
- [ ] 1.5 Show an unreadable or throwing app as a card. Verify: tests named after the scenarios 'An unreadable app shows a card' and 'An app that throws shows the same card' written first and seen failing.
- [ ] 1.6 Pop an inline app out into the side pane. Verify: a test named after the scenario 'An app pops out into the side pane' written first and seen failing.

## 2. First-party views

- [ ] 2.1 Add the view registry with the first view that needs one. Verify: a test named after the scenario 'An open view stays through a theme change' written first and seen failing.
