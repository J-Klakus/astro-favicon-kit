import type { APIRoute } from "astro";
import config from "virtual:astro-favicon-kit";
import { loadSource } from "../core/source";
import { assetResponse } from "../core/respond";

export const prerender = true;

// Loads the source once so a missing/invalid SVG fails this route too,
// not just the image routes.
const GET: APIRoute = async () => {
	await loadSource(config);
	const manifest: Record<string, unknown> = {
		icons: [
			{ src: "/icon-192.png", type: "image/png", sizes: "192x192" },
			{
				src: "/icon-mask.png",
				type: "image/png",
				sizes: "512x512",
				purpose: "maskable",
			},
			{ src: "/icon-512.png", type: "image/png", sizes: "512x512" },
		],
		background_color: config.backgroundColor,
	};
	if (config.name) manifest.name = config.name;
	if (config.shortName) manifest.short_name = config.shortName;
	if (config.themeColor) manifest.theme_color = config.themeColor;
	return assetResponse(JSON.stringify(manifest, null, 2), "application/manifest+json");
};

export { GET };
