import { resolve } from 'node:path';
import process from 'node:process';
import cac from 'cac';
import { C } from './chunk-index.js';
import { createServer, version as version$1, loadEnv } from 'vite';
import { ViteNodeRunner } from './client.js';
import { ViteNodeServer } from './server.js';
import { installSourcemapsSupport } from './source-map.js';
import { toArray } from './utils.js';
import { v as viteNodeHmrPlugin, a as createHotContext, h as handleMessage } from './chunk-hmr.js';
import 'node:module';
import 'node:url';
import 'node:vm';
import 'debug';
import 'node:buffer';
import 'pathe';
import 'node:fs';
import 'node:assert';
import 'node:perf_hooks';
import 'es-module-lexer';
import './constants.js';
import 'node:events';

var version = "5.0.0";

const cli = cac("vite-node");
cli.option("-r, --root <path>", "Use specified root directory").option("-c, --config <path>", "Use specified config file").option("-m, --mode <mode>", "Set env mode").option("-w, --watch", "Restart on file changes, similar to \"nodemon\"").option("--script", "Use vite-node as a script runner").option("--options <options>", "Use specified Vite server options").option("-v, --version", "Output the version number").option("-h, --help", "Display help for command");
cli.command("[...files]").allowUnknownOptions().action(run);
cli.parse(process.argv, { run: false });
if (cli.args.length === 0) cli.runMatchedCommand();
else {
	const i = cli.rawArgs.indexOf(cli.args[0]) + 1;
	const scriptArgs = cli.rawArgs.slice(i).filter((it) => it !== "--");
	const executeArgs = [
		...cli.rawArgs.slice(0, i),
		"--",
		...scriptArgs
	];
	cli.parse(executeArgs);
}
async function run(files, options = {}) {
	var _server$emitter;
	if (options.script) {
		files = [files[0]];
		options = {};
		process.argv = [
			process.argv[0],
			resolve(files[0]),
			...process.argv.slice(2).filter((arg) => arg !== "--script" && arg !== files[0])
		];
	} else process.argv = [...process.argv.slice(0, 2), ...options["--"] || []];
	if (options.version) {
		cli.version(version);
		cli.outputVersion();
		process.exit(0);
	}
	if (options.help) {
		cli.version(version).outputHelp();
		process.exit(0);
	}
	if (!files.length) {
		console.error(C.red("No files specified."));
		cli.version(version).outputHelp();
		process.exit(1);
	}
	const serverOptions = options.options ? parseServerOptions(options.options) : {};
	const server = await createServer({
		logLevel: "error",
		configFile: options.config,
		root: options.root,
		mode: options.mode,
		server: {
			hmr: !!options.watch,
			watch: options.watch ? void 0 : null
		},
		plugins: [options.watch && viteNodeHmrPlugin()]
	});
	if (Number(version$1.split(".")[0]) < 6) await server.pluginContainer.buildStart({});
	else
 // directly access client plugin container until https://github.com/vitejs/vite/issues/19607
	await server.environments.client.pluginContainer.buildStart({});
	const env = loadEnv(server.config.mode, server.config.envDir, "");
	for (const key in env) {
		var _process$env;
		(_process$env = process.env)[key] ?? (_process$env[key] = env[key]);
	}
	const node = new ViteNodeServer(server, serverOptions);
	installSourcemapsSupport({ getSourceMap: (source) => node.getSourceMap(source) });
	const runner = new ViteNodeRunner({
		root: server.config.root,
		base: server.config.base,
		fetchModule(id) {
			return node.fetchModule(id);
		},
		resolveId(id, importer) {
			return node.resolveId(id, importer);
		},
		createHotContext(runner, url) {
			return createHotContext(runner, server.emitter, files, url);
		}
	});
	// provide the vite define variable in this context
	await runner.executeId("/@vite/env");
	for (const file of files) await runner.executeFile(file);
	if (!options.watch) await server.close();
	(_server$emitter = server.emitter) === null || _server$emitter === void 0 || _server$emitter.on("message", (payload) => {
		handleMessage(runner, server.emitter, files, payload);
	});
	if (options.watch) {
		process.on("uncaughtException", (err) => {
			console.error(C.red("[vite-node] Failed to execute file: \n"), err);
		});
		if (process.env.VITE_TEST_WATCHER_DEBUG) {
			// manually check `watcher.getWatched()` to make sure entry files are ready
			// since watcher.on('ready', ...) event is not reliable since 5.1.
			// https://github.com/vitejs/vite/blob/63a39c244b08cf1f2299bc2c3cfddcb82070d05b/playground/hmr-ssr/__tests__/hmr.spec.ts#L1065
			const nodePath = await import('node:path');
			async function waitForWatched(files) {
				while (!files.every((file) => isWatched(file))) await new Promise((resolve) => setTimeout(resolve, 20));
			}
			function isWatched(file) {
				var _watched$dir;
				const watched = server.watcher.getWatched();
				const resolved = nodePath.resolve(file);
				const dir = nodePath.dirname(resolved);
				const base = nodePath.basename(resolved);
				return (_watched$dir = watched[dir]) === null || _watched$dir === void 0 ? void 0 : _watched$dir.includes(base);
			}
			await waitForWatched(files);
			console.log("[debug] watcher is ready");
		}
	}
}
function parseServerOptions(serverOptions) {
	var _serverOptions$deps, _serverOptions$deps2, _serverOptions$deps3, _serverOptions$deps4, _serverOptions$deps5, _serverOptions$deps6, _serverOptions$transf, _serverOptions$transf2;
	const inlineOptions = ((_serverOptions$deps = serverOptions.deps) === null || _serverOptions$deps === void 0 ? void 0 : _serverOptions$deps.inline) === true ? true : toArray((_serverOptions$deps2 = serverOptions.deps) === null || _serverOptions$deps2 === void 0 ? void 0 : _serverOptions$deps2.inline);
	return {
		...serverOptions,
		deps: {
			...serverOptions.deps,
			inlineFiles: toArray((_serverOptions$deps3 = serverOptions.deps) === null || _serverOptions$deps3 === void 0 ? void 0 : _serverOptions$deps3.inlineFiles),
			inline: inlineOptions !== true ? inlineOptions.map((dep) => {
				return dep.startsWith("/") && dep.endsWith("/") ? new RegExp(dep) : dep;
			}) : true,
			external: toArray((_serverOptions$deps4 = serverOptions.deps) === null || _serverOptions$deps4 === void 0 ? void 0 : _serverOptions$deps4.external).map((dep) => {
				return dep.startsWith("/") && dep.endsWith("/") ? new RegExp(dep) : dep;
			}),
			moduleDirectories: ((_serverOptions$deps5 = serverOptions.deps) === null || _serverOptions$deps5 === void 0 ? void 0 : _serverOptions$deps5.moduleDirectories) ? toArray((_serverOptions$deps6 = serverOptions.deps) === null || _serverOptions$deps6 === void 0 ? void 0 : _serverOptions$deps6.moduleDirectories) : void 0
		},
		transformMode: {
			...serverOptions.transformMode,
			ssr: toArray((_serverOptions$transf = serverOptions.transformMode) === null || _serverOptions$transf === void 0 ? void 0 : _serverOptions$transf.ssr).map((dep) => new RegExp(dep)),
			web: toArray((_serverOptions$transf2 = serverOptions.transformMode) === null || _serverOptions$transf2 === void 0 ? void 0 : _serverOptions$transf2.web).map((dep) => new RegExp(dep))
		}
	};
}
