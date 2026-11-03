# astro-favicon-kit

Minimal, canonical favicons for Astro. One square SVG in — the
[Evil Martians-canonical favicon set](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)
out, as an integration and a `<Favicon />` head component.

No `browserconfig.xml`, no Yandex manifests, no Windows tiles, no `shortcut icon`.
Seven files that fit every modern need.

```sh
pnpm add astro-favicon-kit
```

## Usage

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import favicons from "astro-favicon-kit";

export default defineConfig({
  integrations: [
    favicons({
      src: "./src/assets/favicon.svg", // required — path or https URL
      name: "My Site",
      shortName: "MySite",
      themeColor: "#ffffff",
      backgroundColor: "#ffffff",
    }),
  ],
});
```

```astro
---
// src/components/BaseHead.astro
import Favicon from "astro-favicon-kit/Favicon.astro";
---

<Favicon />
<!-- or override the SVG href: <Favicon src="/icon.svg" /> -->
```

Emits:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```

`sizes="32x32"` is deliberate — without it Chrome downloads both the ICO and the SVG.

## Output

| Route | What |
| --- | --- |
| `/favicon.ico` | 32×32 PNG-payload ICO (`icoSizes` option for more sizes) |
| `/favicon.svg` | Byte-for-byte copy of your source — designer-owned `prefers-color-scheme` media queries survive |
| `/apple-touch-icon.png` | 180×180, glyph at 140 with 20px padding on `backgroundColor` |
| `/icon-192.png` | 192×192 |
| `/icon-512.png` | 512×512 |
| `/icon-mask.png` | 512×512 maskable — glyph scaled into the W3C 409/512 safe zone |
| `/manifest.webmanifest` | Generated from your options — no placeholder names |

All responses carry `cache-control: public, max-age=604800`. Routes are
prerendered, so everything lands in `dist/` as static files regardless of
output mode or adapter.

A missing or non-SVG source **fails the build loudly** — a silently-empty
prerendered route would ship a 404.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `src` | — (required) | Square SVG: path relative to the Astro root, or absolute, or an `http(s)` URL |
| `name` | — | Manifest `name` (omitted when unset) |
| `shortName` | — | Manifest `short_name` (omitted when unset) |
| `themeColor` | — | Manifest `theme_color` (omitted when unset) |
| `backgroundColor` | `#ffffff` | Canvas color behind apple-touch and maskable glyphs |
| `icoSizes` | `[32]` | Pixel sizes packed into `favicon.ico` |

## Source requirements

- **Square SVG.** Non-square sources are letterboxed, not cropped.
- Rasterization is done with `sharp` (bundled SVG DPI scaling means small
  intrinsic sizes — e.g. a 32×32 viewBox — still render crisply at 512).

## How it compares

`astro-favicons` (the existing package) generates everything — dozens of
files, legacy manifests, browser configs. This package implements the
minimal canonical set from the Evil Martians article: three link tags plus a
manifest, every file driven from a single SVG.

## Development

```sh
pnpm install
pnpm test        # typecheck + build both fixtures + byte-verify all outputs
```

`test/fixture` uses a local SVG source; `test/fixture-remote` fetches its
source over HTTP to exercise the URL path.
