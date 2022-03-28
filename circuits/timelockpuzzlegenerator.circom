pragma circom 2.0.3;

template TimeLockedPuzzleGenerator()
{
  signal input n;
  signal input phi;
  signal input t;
  signal input msg;
  signal input a;

  signal output puzzle;

  signal e;
  signal e2;
  signal b;
  signal b2;
  signal p1;
  e<--(2**t) % phi;
  e2<==e;
  b<--(a**e2) % n;
  b2<==b;
  p1<-- ((msg % n)+b2) %n ;
  puzzle<==p1;

}
