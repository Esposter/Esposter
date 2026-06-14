rm -rf pnpm-lock.yaml
find . -name "node_modules" -type d -prune -exec rm -rf {} +
pnpm i
