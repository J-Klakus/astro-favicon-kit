import type { APIRoute } from "astro";
import config from "virtual:astro-favicon-kit";
import { padTo } from "../core/canvas";
import { rasterizePng } from "../core/rasterize";
import { assetResponse } from "../core/respond";
import { loadSource } from "../core/source";

export const prerender = true;

// 180×180 canvas with 20px padding around a 140×140 glyph — iOS rounds and
// composites the result, and a padded icon reads better than a full-bleed one.
const SIZE = 180;
const GLYPH = 140;

const GET: APIRoute = async () => {
	const svg = await loadSource(config);
	const glyph = await rasterizePng(svg, GLYPH);
	return assetResponse(await padTo(glyph, SIZE, config.backgroundColor), "image/png");
};

export { GET };
