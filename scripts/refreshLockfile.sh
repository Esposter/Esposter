rm -rf bun.lock
find . -name "node_modules" -type d -exec rm -rf {} +
bun --bun i
