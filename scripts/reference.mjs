import {execFileSync} from 'node:child_process';
import {readdirSync,mkdirSync} from 'node:fs';
mkdirSync('evidence',{recursive:true});
execFileSync('c++',['-std=c++17','-O2','-I','vendor/bc-lifehash/src','tests/reference.cpp',...readdirSync('vendor/bc-lifehash/src').filter(s=>s.endsWith('.cpp')).map(s=>`vendor/bc-lifehash/src/${s}`),'-o','evidence/reference-renderer'],{stdio:'inherit'});
