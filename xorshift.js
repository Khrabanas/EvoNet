//will eventually replace rand() in testnet.js
//this is what I can use to test xorshift.
random = xor4096(1);
a = 0;
randarray = [];
for(i=0;i<1000000;i++){randarray[i]=random();}
for(i=0;i<randarray.length;i++){a += randarray[i]}
console.log(a/randarray.length);
