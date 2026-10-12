#include "lifehash.h"
#include <iostream>
#include <string>
int main(int argc,char** argv){if(argc!=2)return 1;std::string s=argv[1];uint8_t digest[32];for(int i=0;i<32;i++)digest[i]=std::stoi(s.substr(i*2,2),nullptr,16);auto image=lifehash_make_from_digest(digest,lifehash_version2,1,true);std::cout<<"[";for(size_t i=0;i<image->width*image->height*4;i++){if(i)std::cout<<",";std::cout<<int(image->colors[i]);}std::cout<<"]";lifehash_image_free(image);}
