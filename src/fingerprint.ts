export function fingerprintMarkup(pixels: readonly number[]): string {
 let rectangles='';
 for(let y=0;y<32;y++)for(let x=0;x<32;){
  const at=(y*32+x)*4;const [r,g,b,a]=pixels.slice(at,at+4);let width=1;
  while(x+width<32&&pixels.slice(at+width*4,at+width*4+4).every((v,i)=>v===pixels[at+i]))width++;
  rectangles+=`<rect x="${x}" y="${y}" width="${width}" height="1" fill="rgb(${r},${g},${b})" fill-opacity="${a/255}"/>`;x+=width;
 }
 return rectangles;
}
export function fingerprintURI(pixels: readonly number[]): string {
 const rectangles=fingerprintMarkup(pixels);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">${rectangles}</svg>`;
 return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Lossless 32px coat image. Stored DEFLATE blocks keep encoding deterministic
// and avoid Canvas, compression libraries, or browser-only module initialization.
export function fingerprintPNGURI(pixels:readonly number[]):string {
 const u32=(n:number)=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
 const chunk=(type:string,data:number[])=>{
  const body=[...Array.from(type,c=>c.charCodeAt(0)),...data];let crc=0xffffffff;
  for(const byte of body){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return [...u32(data.length),...body,...u32((crc^0xffffffff)>>>0)];
 };
 const raw:number[]=[];
 for(let y=0;y<32;y++){raw.push(0);for(let x=0;x<128;x++)raw.push(pixels[y*128+x]);}
 let a=1,b=0;for(const byte of raw){a=(a+byte)%65521;b=(b+a)%65521;}
 const n=raw.length;const compressed=[0x78,0x01,0x01,n&255,n>>>8,(~n)&255,((~n)>>>8)&255,...raw,...u32((b*65536+a)>>>0)];
 const bytes=[137,80,78,71,13,10,26,10,...chunk('IHDR',[...u32(32),...u32(32),8,6,0,0,0]),...chunk('IDAT',compressed),...chunk('IEND',[])];
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let encoded='';
 for(let i=0;i<bytes.length;i+=3){const value=(bytes[i]<<16)|((bytes[i+1]??0)<<8)|(bytes[i+2]??0);encoded+=alphabet[(value>>>18)&63]+alphabet[(value>>>12)&63]+(i+1<bytes.length?alphabet[(value>>>6)&63]:'=')+(i+2<bytes.length?alphabet[value&63]:'=');}
 return 'data:image/png;base64,'+encoded;
}
