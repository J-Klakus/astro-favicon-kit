#!/bin/sh
# Full verification: typecheck, build both fixtures, byte-check all outputs.
set -e
pnpm check
pnpm --filter fixture-local build
node scripts/verify.mjs test/fixture/dist test/fixture/src/assets/favicon.svg
node test/fixture-remote/serve.mjs &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
pnpm --filter fixture-remote build
node scripts/verify.mjs test/fixture-remote/dist test/fixture-remote/assets/favicon.svg
