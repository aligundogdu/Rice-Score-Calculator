import { FetchHandler, NodeHttpHandler, NodeServerRequest, NodeServerResponse, Server, ServerOptions, ServerRequest } from "../_chunks/types-sQhe-gMy.mjs";
import { FastURL$2 as FastURL } from "../_chunks/_url-Dd8UPFqt.mjs";
import { Readable } from "node:stream";

//#region src/adapters/_node/request.d.ts
type NodeRequestContext = {
  req: NodeServerRequest;
  res?: NodeServerResponse;
};
declare const NodeRequest: {
  new (nodeCtx: NodeRequestContext): ServerRequest;
};
//#endregion
//#region src/adapters/_node/response.d.ts
// prettier-ignore
type PreparedNodeResponseBody = string | Buffer | Uint8Array | DataView | ReadableStream | Readable | undefined | null;
interface PreparedNodeResponse {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: PreparedNodeResponseBody;
}
/**
* Fast Response for Node.js runtime
*
* It is faster because in most cases it doesn't create a full Response instance.
*/
declare const NodeResponse: {
  new (body?: BodyInit | null, init?: ResponseInit): globalThis.Response & {
    _toNodeResponse: () => PreparedNodeResponse;
  };
};
type NodeResponse = InstanceType<typeof NodeResponse>;
//#endregion
//#region src/adapters/_node/send.d.ts
declare function sendNodeResponse(nodeRes: NodeServerResponse, webRes: Response | NodeResponse): Promise<void>;
//#endregion
//#region src/adapters/_node/web/fetch.d.ts
// https://github.com/nodejs/node/blob/main/lib/_http_incoming.js
// https://github.com/nodejs/node/blob/main/lib/_http_outgoing.js
// https://github.com/nodejs/node/blob/main/lib/_http_server.js
/**
* Calls a Node.js HTTP Request handler with a Fetch API Request object and returns a Response object.
*
* If the web Request contains an existing Node.js req/res pair (indicating it originated from a Node.js server from srvx/node), it will be called directly.
*
* Otherwise, new Node.js IncomingMessage and ServerResponse objects are created and linked to a custom Duplex stream that bridges the Fetch API streams with Node.js streams.
*
* The handler is invoked with these objects, and the response is constructed from the ServerResponse once it is finished.
*
* @experimental Behavior might be unstable.
*/
declare function fetchNodeHandler(handler: NodeHttpHandler, req: ServerRequest): Promise<Response>;
//#endregion
//#region src/adapters/_node/adapter.d.ts
type AdapterMeta = {
  __nodeHandler?: NodeHttpHandler;
  __fetchHandler?: FetchHandler;
};
/**
* Converts a Fetch API handler to a Node.js HTTP handler.
*/
declare function toNodeHandler(handler: FetchHandler & AdapterMeta): NodeHttpHandler & AdapterMeta;
/**
* Converts a Node.js HTTP handler into a Fetch API handler.
*
* @experimental Behavior might be unstable and won't work in Bun and Deno currently (tracker: https://github.com/h3js/srvx/issues/132)
*/
declare function toFetchHandler(handler: NodeHttpHandler & AdapterMeta): FetchHandler & AdapterMeta;
//#endregion
//#region src/adapters/node.d.ts
declare function serve(options: ServerOptions): Server;
//#endregion
export { NodeResponse as FastResponse, FastURL, NodeRequest, NodeResponse, fetchNodeHandler, sendNodeResponse, serve, toFetchHandler, toNodeHandler };