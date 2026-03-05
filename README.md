# @sig-ui/dom

Browser runtime helpers for SigUI.
Includes animation utilities, device-context monitoring, runtime brand CSS injection, and DOM token helpers.

## Install

```bash
bun add @sig-ui/dom
```

## Quick start

```js
import { applyBrandColor } from "@sig-ui/dom";
import { animate } from "@sig-ui/dom/animate";

applyBrandColor("#6366f1");

animate(".card", { y: [8, 0], opacity: [0, 1] }, { duration: "normal" });
```

## Entry points

- `@sig-ui/dom`: runtime APIs (brand runtime, CSS injection, breakpoint and device helpers)
- `@sig-ui/dom/animate`: `animate`, `stagger`, `flip`, `inView`, `sequence`, `drawStroke`, `morphPath`
- `@sig-ui/dom/spacing`: spacing runtime helpers
- `@sig-ui/dom/manager`: color manager exports
- `@sig-ui/dom/viz`: categorical/sequential/diverging palette helpers
- `@sig-ui/dom/inspector`: `ThemeInspector`

## Common uses

- Apply a brand palette dynamically at runtime
- Animate DOM elements with token-friendly durations and easings
- Observe device context and adjust UI tokens
- Inject/remove CSS declarations programmatically
