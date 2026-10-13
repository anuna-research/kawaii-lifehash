import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const voices=new Set(['Samantha','Daniel','Karen','Moira','Tessa']);
export function localSpeech(){
 return {name:'local-character-speech',configureServer(server){
  server.middlewares.use('/api/speech',async(req,res)=>{
   if(req.method!=='POST'){res.statusCode=405;res.end();return;}
   // Only the same local site can ask the development server to synthesize speech.
   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.statusCode=403;res.end();return;}
   let directory;
   try{
    let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>12000)throw new Error('Request too large.');}
    const {text,voice,rate}=JSON.parse(body);
    if(typeof text!=='string'||!text.trim()||text.length>1000||!voices.has(voice)||!Number.isInteger(rate)||rate<90||rate>260){res.statusCode=400;res.end('Invalid speech request.');return;}
    directory=await mkdtemp(join(tmpdir(),'kawaii-speech-'));
    const file=join(directory,'speech.wav');
    await new Promise((resolve,reject)=>{
     const child=spawn('/usr/bin/say',['-v',voice,'-r',String(rate),'-o',file,'--file-format=WAVE','--data-format=LEI16@22050','-f','-'],{stdio:['pipe','ignore','pipe']});
     const timer=setTimeout(()=>{child.kill();reject(new Error('Speech synthesis timed out.'));},20000);
     child.on('error',error=>{clearTimeout(timer);reject(error);});
     child.on('close',code=>{clearTimeout(timer);code===0?resolve():reject(new Error('Speech synthesis failed.'));});
     child.stdin.on('error',()=>{});child.stdin.end(text);
    });
    const audio=await readFile(file);res.setHeader('Content-Type','audio/wav');res.setHeader('Cache-Control','no-store');res.end(audio);
   }catch{res.statusCode=500;res.end('Local speech synthesis is unavailable.');}
   finally{if(directory)await rm(directory,{recursive:true,force:true});}
  });
 }};
}
