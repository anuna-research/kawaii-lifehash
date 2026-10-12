import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
await rm('dist', {recursive:true, force:true});
await mkdir('dist/engine', {recursive:true});
const wasm = await readFile('src/engine/lifehash.wasm');
await writeFile('src/wasm.ts', `// Generated from the pinned official LifeHash WASM.\nconst bytes: string = '${wasm.toString('base64')}';\nexport default bytes;\n`);
execFileSync('node', ['node_modules/typescript/bin/tsc'], {stdio:'inherit'});
for (const file of ['lifehash.js','lifehash.wasm','LICENSE.md','bc-lifehash-LICENSE.md']) await copyFile(`src/engine/${file}`,`dist/engine/${file}`);
await copyFile('src/styles.css','dist/styles.css');
