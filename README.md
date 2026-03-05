# @sig-ui/dom

Runtime DOM helpers for SigUI: animation utilities, device-context detection, runtime brand CSS injection, and token helpers.

## Install

```bash
bun add @sig-ui/dom
```

## Quick start

```js
import { applyBrandColor, removeBrandColor } from "@sig-ui/dom";
import { animate } from "@sig-ui/dom/animate";

applyBrandColor("#6366f1");

animate(".card", { y: [8, 0], opacity: [0, 1] }, { duration: "normal" });

// removeBrandColor();
```

## Common entry points

- `@sig-ui/dom` - runtime APIs (brand, CSS injection, breakpoints, device context).
- `@sig-ui/dom/animate` - WAAPI-based animation helpers (`animate`, `stagger`, `flip`, `inView`, `sequence`).
- `@sig-ui/dom/spacing` - runtime spacing/base-unit reader.
- `@sig-ui/dom/manager` - color manager export.
- `@sig-ui/dom/viz` - categorical/sequential/diverging palette helpers.
- `@sig-ui/dom/inspector` - `ThemeInspector`.

## Typical use cases

- Apply brand palettes dynamically at runtime.
- Animate elements with token-friendly durations/easing.
- Adapt tokens based on device/context signals.
- Inject and remove CSS declarations programmatically.
