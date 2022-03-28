const random=require("random-bigint");
const forge=require("node-forge");// to create a large prime number easly
const bigintCryptoUtils=require("bigint-crypto-utils");
const now=require("nano-time");

function findM(msg,nbits)
{

  let m;
  let r;
    do {
      m=bigintCryptoUtils.randBetween(BigInt(2)**BigInt(nbits),BigInt(1));
      r=bigintCryptoUtils.toZn(m,2)
    } while (r!=msg);

  return m;
}
async function generate(m,tsec,s,nbits)
{
  t=s*tsec;
  p=await bigintCryptoUtils.prime(nbits)
  q=await bigintCryptoUtils.prime(nbits)

  n=p*q

  phi=(p-1n)*(q-1n)

  a=bigintCryptoUtils.randBetween((n-1n),BigInt(1))

  e=bigintCryptoUtils.modPow(BigInt(2),t,phi)

  b=bigintCryptoUtils.modPow(a,e,n)

  c=bigintCryptoUtils.toZn(bigintCryptoUtils.toZn(m,n)+b,n)

  return [c,a,t,n,p,q,phi]
}
async function solve(c,a,t,n)
{
  var start_time = new Date().getTime()

  b=bigintCryptoUtils.toZn(a,n)

  for(var i=0;i<t;i++)
  {
     b=bigintCryptoUtils.modPow(b,2,n)
  }

  m=bigintCryptoUtils.toZn(c-b,n)

  var runtime = (new Date().getTime() - start_time) / 1000;
  return m;
}

function calculateS()
{
  n=BigInt(2)**BigInt(2048)
  a=bigintCryptoUtils.randBetween(n)
  b=bigintCryptoUtils.randBetween(n)
  var start_time = new Date().getTime()
  var start_t=BigInt(now())

  r=bigintCryptoUtils.toZn(a+b,n)

  var finish_t=BigInt(now())

  var runtime = finish_t-start_t

  s=BigInt("1000000000")/runtime
  return s
}
