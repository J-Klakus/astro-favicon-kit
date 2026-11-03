import sharp from "sharp";
import { rasterizePng } from "./rasterize";

/** Center a PNG on a `size × size` canvas filled with `background`. */
export async function padTo(png: Buffer, size: number, background: string): Promise<Buffer> {
	return sharp({ create: { width: size, height: size, channels: 4, background } })
		.composite([{ input: png, gravity: "center" }])
		.png()
		.toBuffer();
}

/**
 * Maskable icon per the W3C manifest spec: the glyph must fit inside the safe
 * zone — a centered circle at 409/512 of the canvas — so launchers can crop
 * it into any shape.
 */
export async function maskablePng(svg: Buffer, size: number, background: string): Promise<Buffer> {
	const glyphSize = Math.round((size * 409) / 512);
	return padTo(await rasterizePng(svg, glyphSize), size, background);
}
