// Verifies a fixture build output: byte-level ICO/PNG checks + manifest + head markup.
// Usage: node scripts/verify.mjs <dist-dir> [source-svg]
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dist = process.argv[2];
if (!dist) {
	console.error("usage: node verify.mjs <dist-dir> [source-svg]");
	process.exit(1);
}
const sourceSvg = process.argv[3];

let failures = 0;
function expect(cond, msg) {
	if (cond) {
		console.log(`ok: ${msg}`);
	} else {
		failures++;
		console.error(`FAIL: ${msg}`);
	}
}

const read = (p) => readFileSync(join(dist, p));
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

function pngDims(buf) {
	return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// favicon.ico
const ico = read("favicon.ico");
expect(ico[0] === 0 && ico[1] === 0 && ico[2] === 1 && ico[3] === 0, "ICO: ICONDIR magic");
const entryCount = ico.readUInt16LE(4);
expect(entryCount === 1, "ICO: single entry");
const entry = ico.subarray(6, 22);
expect(entry[0] === 32 && entry[1] === 32, "ICO: entry declares 32x32");
const payloadSize = entry.readUInt32LE(8);
const payloadOffset = entry.readUInt32LE(12);
expect(payloadOffset === 22, "ICO: payload directly after directory");
const payload = ico.subarray(payloadOffset, payloadOffset + payloadSize);
expect(payload.subarray(0, 4).equals(PNG_SIG), "ICO: PNG payload");
expect(pngDims(payload).w === 32, "ICO: PNG payload is 32px wide");
expect(ico.length === payloadOffset + payloadSize, "ICO: no trailing bytes");

// PNG outputs
for (const [file, expected] of [
	["apple-touch-icon.png", 180],
	["icon-192.png", 192],
	["icon-512.png", 512],
	["icon-mask.png", 512],
]) {
	const buf = read(file);
	expect(buf.subarray(0, 4).equals(PNG_SIG), `${file}: PNG signature`);
	const { w, h } = pngDims(buf);
	expect(w === expected && h === expected, `${file}: ${expected}x${expected} (got ${w}x${h})`);
}

// SVG passthrough byte-equal
const svg = read("favicon.svg");
if (sourceSvg) {
	const source = readFileSync(sourceSvg);
	expect(svg.equals(source), "SVG: byte-identical to source");
} else {
	expect(svg.toString("utf8").includes("<svg"), "SVG: contains <svg");
}

// Manifest
const manifest = JSON.parse(read("manifest.webmanifest").toString("utf8"));
expect(Array.isArray(manifest.icons) && manifest.icons.length === 3, "manifest: 3 icons");
expect(manifest.icons[0].sizes === "192x192", "manifest: icon-192 sizes");
expect(manifest.icons[1].purpose === "maskable", "manifest: maskable purpose");
expect(manifest.icons[2].sizes === "512x512", "manifest: icon-512 sizes");

// Head markup
const html = read("index.html").toString("utf8");
expect(html.includes('rel="icon" href="/favicon.ico" sizes="32x32"'), "html: ICO link with sizes");
expect(html.includes('rel="icon" href="/favicon.svg" type="image/svg+xml"'), "html: SVG link");
expect(html.includes('rel="apple-touch-icon" href="/apple-touch-icon.png"'), "html: apple-touch link");
expect(html.includes('rel="manifest" href="/manifest.webmanifest"'), "html: manifest link");
expect(!html.includes("shortcut icon"), "html: no invalid shortcut icon");

if (failures > 0) {
	console.error(`\n${failures} check(s) failed`);
	process.exit(1);
}
console.log("\nall checks passed");
