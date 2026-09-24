# RTK - Rust Token Killer

**Usage**: Token-optimized CLI proxy for shell commands (typically 60–90% fewer tokens).

## Rule

Always prefix shell commands with `rtk`. Commands RTK has no filter for run as-is, so the prefix is always safe.

Keep the prefix inside chains: `rtk git add . && rtk git commit -m "msg"`.

Examples:

```bash
rtk git status
rtk cargo test
rtk npm run build
rtk pytest -q
rtk ls src/
rtk tsc
rtk lint
```

## Command output

Output is condensed on purpose. Treat it as the complete result; batch related commands in one call. Re-run as `rtk proxy <cmd>` only when the result is unusable (empty when output was expected, contradicts exit code, or garbled).

## Meta Commands

```bash
rtk gain            # Token savings analytics
rtk gain --history  # Recent command savings history
rtk proxy <cmd>     # Run raw command without filtering
rtk discover        # Find past commands RTK could have condensed
```

## Verification

```bash
rtk --version
rtk gain
which rtk
```
