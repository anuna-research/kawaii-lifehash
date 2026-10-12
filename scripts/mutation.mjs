import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const file='src/index.ts';const original=await readFile(file,'utf8');
try {
 const mutant=original.replace('if (!(d>=0xdc00&&d<=0xdfff))', 'if (false)');
 if(mutant===original)throw new Error('Mutation target absent.');
 await writeFile(file,mutant);let build=spawnSync('npm',['run','build'],{encoding:'utf8'});if(build.status)throw new Error(build.stdout+build.stderr);
 const result=spawnSync('npx',['playwright','test','tests/generator.spec.ts','--project','chromium','--grep','TEST-003'],{encoding:'utf8'});
 await writeFile('evidence/mutation-surrogate.txt',result.stdout+result.stderr);
 if(result.status===0)throw new Error('Surrogate-recognition mutation survived.');
 console.log('Surrogate-recognition mutation killed by TEST-003.');
} finally {await writeFile(file,original);spawnSync('npm',['run','build'],{stdio:'inherit'});}
