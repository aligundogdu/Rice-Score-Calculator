import "../_chunks/_color-Dtg6hRMg.mjs";
import { createWaitUntil } from "../_chunks/_utils-DS1d5FUa.mjs";
import { errorPlugin, wrapFetch } from "../_chunks/_plugins-CPeJORNN.mjs";

//#region src/adapters/generic.ts
const FastURL = URL;
const FastResponse = Response;
function serve(options) {
	return new GenericServer(options);
}
var GenericServer = class {
	runtime = "generic";
	options;
	fetch;
	#wait;
	constructor(options) {
		this.options = {
			...options,
			middleware: [...options.middleware || []]
		};
		for (const plugin of options.plugins || []) plugin(this);
		errorPlugin(this);
		this.#wait = createWaitUntil();
		const fetchHandler = wrapFetch(this);
		this.fetch = (request) => {
			Object.defineProperties(request, { waitUntil: { value: this.#wait.waitUntil } });
			return Promise.resolve(fetchHandler(request));
		};
	}
	serve() {}
	ready() {
		return Promise.resolve(this);
	}
	async close() {
		await this.#wait.wait();
	}
};

//#endregion
export { FastResponse, FastURL, serve };