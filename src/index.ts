import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import type { Plugin } from "vite";

export interface FaviconKitOptions {
	/**
	 * Source square SVG: a file path relative to the Astro root (or absolute),
	 * or an http(s) URL. Required.
	 */
	src: string;
	/** Web app manifest `name`. Omitted from the manifest when unset. */
	name?: string;
	/** Web app manifest `short_name`. Omitted from the manifest when unset. */
	shortName?: string;
	/** Web app manifest `theme_color`. Omitted from the manifest when unset. */
	themeColor?: string;
	/**
	 * Canvas color behind the glyph for apple-touch-icon and the maskable icon.
	 * Defaults to `#ffffff`.
	 */
	backgroundColor?: string;
	/** Pixel sizes packed into favicon.ico. Defaults to `[32]` per the Evil Martians canonical set. */
	icoSizes?: number[];
}

interface ResolvedOptions {
	src: string;
	root: string;
	name?: string;
	shortName?: string;
	themeColor?: string;
	backgroundColor: string;
	icoSizes: number[];
}

const VIRTUAL_MODULE_ID = "virtual:astro-favicon-kit";
const RESOLVED_ID = `\0${VIRTUAL_MODULE_ID}`;

const ROUTES: Array<{ pattern: string; file: string }> = [
	{ pattern: "/favicon.ico", file: "ico.ts" },
	{ pattern: "/favicon.svg", file: "svg.ts" },
	{ pattern: "/apple-touch-icon.png", file: "apple-touch.ts" },
	{ pattern: "/icon-192.png", file: "icon-192.ts" },
	{ pattern: "/icon-512.png", file: "icon-512.ts" },
	{ pattern: "/icon-mask.png", file: "icon-mask.ts" },
	{ pattern: "/manifest.webmanifest", file: "manifest.ts" },
];

export default function favicons(options: FaviconKitOptions): AstroIntegration {
	if (!options?.src) {
		throw new Error(
			'[astro-favicon-kit] "src" is required — a square SVG path or an https URL.',
		);
	}

	const resolved: ResolvedOptions = {
		src: options.src,
		root: "",
		name: options.name,
		shortName: options.shortName,
		themeColor: options.themeColor,
		backgroundColor: options.backgroundColor ?? "#ffffff",
		icoSizes: options.icoSizes ?? [32],
	};

	const virtualConfig: Plugin = {
		name: "astro-favicon-kit:virtual-config",
		resolveId(id) {
			return id === VIRTUAL_MODULE_ID ? RESOLVED_ID : null;
		},
		load(id) {
			if (id === RESOLVED_ID) return `export default ${JSON.stringify(resolved)}`;
		},
	};

	return {
		name: "astro-favicon-kit",
		hooks: {
			"astro:config:setup": ({ config, injectRoute, updateConfig }) => {
				resolved.root = fileURLToPath(config.root);
				updateConfig({
					vite: {
						plugins: [virtualConfig],
						ssr: { external: ["sharp"] },
					},
				});
				for (const route of ROUTES) {
					injectRoute({
						pattern: route.pattern,
						entrypoint: new URL(`./routes/${route.file}`, import.meta.url),
						prerender: true,
					});
				}
			},
		},
	};
}
