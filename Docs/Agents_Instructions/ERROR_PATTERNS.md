# Error Patterns & Fixes

## ResizeObserver loop completed with undelivered notifications

**Root cause:** ResizeObserver callback triggered DOM mutations that caused additional layout recalculation before the original observation cycle completed.

**Standard fixes:**
- Use `setTimeout` to defer mutations until after the observation cycle
- Wrap logic in `requestAnimationFrame` to align with render cycle

**Prevention:**
- Use `useLayoutEffect` instead of `useEffect` for ResizeObserver setup
- Batch multiple dimension reads before writes

## Cannot read properties of undefined (reading 'toLowerCase')

**Root cause:** Attempting to call `.toLowerCase()` on a variable that is `undefined` or `null`.

**Standard fixes:**
- Use safe navigation with logical OR fallback: `(obj.field || "").toLowerCase().includes(...)`
- Use optional chaining with multiple guards: `obj.field?.toLowerCase()?.includes(...)`

**Prevention:**
- Always assume structural inputs (imports, props) can have missing fields.

## Duplicate React keys

**Root cause:** Using array index as key with dynamic reordering, or non-unique ID fields.

**Standard fixes:**
- Generate keys with UUIDs or stable identifiers from backend.

## Sandbox Environment window.confirm Limitation

**Root cause:** Native browser prompts like `window.confirm`, `window.alert`, or `window.prompt` fail or block indefinitely inside sandboxed iframe previews.

**Standard fixes:**
- Replace all native `confirm` prompt calls with state-controlled custom dialogs (e.g. Radix `AlertDialog` or `Dialog` primitives).
- Use callback-based async closures to defer actions until the user selects "Confirm" on the custom modal.

## Response Protocol

When error detected:
1. **Identify** – Match error pattern from above
2. **Apply** – Use standard fix immediately without asking
3. **Report** – `[FIXED] Error: [type] → Applied: [fix name]`
4. **If unfamiliar** – Stop and ask for guidance
