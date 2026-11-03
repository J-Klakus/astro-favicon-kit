import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

export interface SourceConfig {
	/** Path to a square SVG (relative to the Astro root or absolute) or an http(s) URL. */
	src: string;
	/** The Astro project root, used to resolve relative paths. */
	root: string;
}

let cache: Promise<Buffer> | null = null;

/**
 * Load the favicon source SVG once per build. Routes run at build time
 * (prerendered), so a hard failure here is loud instead of shipping a 404.
 */
export function loadSource(config: SourceConfig): Promise<Buffer> {
	if (!cache) cache = load(config.src, config.root);
	return cache;
}

async function load(src: string, root: string): Promise<Buffer> {
	if (/^https?:\/\//.test(src)) {
		const res = await fetch(src);
		if (!res.ok) {
			throw new Error(
				`[astro-favicon-kit] Failed to fetch favicon source (${res.status} ${res.statusText}): ${src}`,
			);
		}
		const body = Buffer.from(await res.arrayBuffer());
		assertSvg(body, src);
		return body;
	}

	const file = isAbsolute(src) ? src : resolve(root, src);
	let body: Buffer;
	try {
		body = await readFile(file);
	} catch (cause) {
		throw new Error(
			`[astro-favicon-kit] Favicon source not found: ${file} — set "src" to a square SVG file or an https URL.`,
			{ cause },
		);
	}
	assertSvg(body, file);
	return body;
}

function assertSvg(body: Buffer, origin: string): void {
	if (!body.subarray(0, 2048).toString("utf8").includes("<svg")) {
		throw new Error(
			`[astro-favicon-kit] Source is not an SVG: ${origin} — astro-favicon-kit requires a square SVG.`,
		);
	}
}
