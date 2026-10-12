import {readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const excluded=new Set(['node_modules','.git','dist','demo-dist','test-results','playwright-report','artifacts']);const files=[];
async function visit(dir){for(const item of await readdir(dir,{withFileTypes:true})){if(excluded.has(item.name))continue;const path=join(dir,item.name);if(item.isDirectory()){await visit(path);continue;}if(path==='src/wasm.ts'||path==='evidence/source-manifest.json'||path==='evidence/reference-renderer')continue;const bytes=await readFile(path);files.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}}
await visit('.');files.sort((a,b)=>a.path.localeCompare(b.path));
const direct=[];for(const name of ['typescript','vite','highlight.js','@playwright/test','playwright','playwright-core']){const p=JSON.parse(await readFile(join('node_modules',name,'package.json'),'utf8'));direct.push({name:p.name,version:p.version,license:p.license,source:p.repository});}
await writeFile('evidence/dependencies.json',JSON.stringify(direct,null,2));
await writeFile('evidence/source-manifest.json',JSON.stringify({basis:'Initial workspace: supplied brief and official LifeHash material. Later shapes and expressions use the owner-authorized hosted reference.',dependencies:direct,engineSources:[{source:'https://github.com/BlockchainCommons/lifehash-web',commit:'58a36a2aa400609f09a36bcf5f2f94e9b6a9c84b',license:'BSD-2-Clause-Patent'},{source:'https://github.com/BlockchainCommons/bc-lifehash',commit:'0444dbed5615fbc9a98163608c6499c025b7873b',license:'BSD-2-Clause-Patent'}],files},null,2));
