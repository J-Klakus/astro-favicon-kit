import { defineConfig } from "astro/config";
import favicons from "astro-favicon-kit";

// Serves src over HTTP to exercise the URL source path — start it with:
//   node serve.mjs
export default defineConfig({
	integrations: [
		favicons({
			src: "http://127.0.0.1:8787/favicon.svg",
			name: "Fixture Remote",
		}),
	],
});
