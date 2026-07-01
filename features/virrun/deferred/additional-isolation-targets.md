Broaden virrun's isolation surface beyond the shipped Linux/WSL `os` backend: a macOS bridge through a lightweight Linux VM, and a Firecracker microVM backend for untrusted multi-tenant / CI fan-out.

## Why deferred

The Linux + WSL `os` backend already covers this repo's dev hosts. Adding more isolation targets is breadth, not depth — and the current focus is making the existing path as fast and as usable as possible (UX), not running on more platforms. A second OS bridge and a microVM backend each carry real ongoing maintenance and a fresh correctness-gate surface for no immediate dev-loop payoff.

## Revisit when

The Linux/WSL path's speed + UX goals are met and a concrete consumer needs it — a macOS dev host with no WSL equivalent, or an untrusted multi-tenant / CI fan-out workload that the rootless bubblewrap sandbox can't safely host.
