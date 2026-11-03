// Tiny static server for the remote-source fixture build:
//   node serve.mjs &
//   pnpm build
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "assets");

createServer((req, res) => {
	try {
		const body = readFileSync(join(root, req.url ?? "/favicon.svg"));
		res.writeHead(200, { "content-type": "image/svg+xml" });
		res.end(body);
	} catch {
		res.writeHead(404);
		res.end();
	}
}).listen(8787, "127.0.0.1", () => {
	console.log("fixture server on http://127.0.0.1:8787");
});
