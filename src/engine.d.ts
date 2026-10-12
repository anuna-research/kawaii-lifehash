declare module '*engine/lifehash.js' {
 const create: (options: {wasmBinary: Uint8Array; print: (s: string) => void; printErr: (s: string) => void}) => Promise<any>;
 export default create;
}
