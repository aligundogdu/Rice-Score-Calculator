import { BunFetchHandler, Server, ServerOptions } from "../_chunks/types-sQhe-gMy.mjs";
import { FastURL$2 as FastURL } from "../_chunks/_url-Dd8UPFqt.mjs";
import * as bun from "bun";

//#region src/adapters/bun.d.ts
declare const FastResponse: typeof globalThis.Response;
declare function serve(options: ServerOptions): BunServer;
// https://bun.sh/docs/api/http
declare class BunServer implements Server<BunFetchHandler> {
  #private;
  readonly runtime = "bun";
  readonly options: Server["options"];
  readonly bun: Server["bun"];
  readonly serveOptions: bun.Serve.Options<any>;
  readonly fetch: BunFetchHandler;
  constructor(options: ServerOptions);
  serve(): Promise<this>;
  get url(): string | undefined;
  ready(): Promise<this>;
  close(closeAll?: boolean): Promise<void>;
}
//#endregion
export { FastResponse, FastURL, serve };