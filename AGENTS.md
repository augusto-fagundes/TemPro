@RTK.md

# Terminal: always use RTK

**Always** prefix shell/terminal commands with `rtk`. RTK filters output to save tokens; if there is no dedicated filter, the command passes through unchanged — so the prefix is always safe.

## Rule

```bash
# Wrong
git status
npm run build
cargo test

# Correct
rtk git status
rtk npm run build
rtk cargo test
```

Keep the prefix inside chains:

```bash
# Wrong
git add . && git commit -m "msg" && git push

# Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## Common commands

```bash
rtk git status|log|diff|add|commit|push|pull|branch
rtk gh pr view|checks
rtk ls <path>
rtk grep <pattern>
rtk find <pattern>
rtk tsc
rtk lint
rtk vitest|jest|pytest
rtk pnpm|npm|npx <args>
rtk docker ps|images|logs
rtk err <cmd>
rtk test <cmd>
```

## Meta

```bash
rtk gain              # token savings
rtk gain --history    # per-command history
rtk proxy <cmd>       # unfiltered (only if filtered output is unusable)
```

Treat RTK output as the complete result. Do not re-run with `rtk proxy` unless the result is empty when output was expected, contradicts the exit code, or is garbled.
