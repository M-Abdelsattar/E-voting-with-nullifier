pragma circom 2.0.3;

include "../circomlib/circuits/mimcsponge.circom";
include "timelockpuzzlegenerator.circom";

template Main() {
  signal input secret;
  signal input r;
  signal input hash1;
  signal input hash2;
  signal input hash3;
  signal input msg;
  signal input n;
  signal input phi;
  signal input t;
  signal input a;
  signal input puzzle;

  signal x;

  signal output msgAttestation;
  signal output nullifierAttestation;

  component mimcSecret = MiMCSponge(1, 220, 1);
  mimcSecret.ins[0] <== secret;
  mimcSecret.k <== 0;
  x <== mimcSecret.outs[0];

  signal temp;
  temp <== (x - hash1) * (x - hash2);
  0 === temp * (x - hash3);

  component mimcnullifierAttestation = MiMCSponge(2,220,1);
  mimcnullifierAttestation.ins[0] <== r;
  mimcnullifierAttestation.ins[1] <== secret;
  mimcnullifierAttestation.k <== 0;
  nullifierAttestation<==mimcnullifierAttestation.outs[0];

  component timeLockedPuzzle= TimeLockedPuzzleGenerator();
  timeLockedPuzzle.n<==n;
  timeLockedPuzzle.phi<==phi;
  timeLockedPuzzle.t<==t;
  timeLockedPuzzle.a<==a;
  timeLockedPuzzle.msg<==msg;
  puzzle===timeLockedPuzzle.puzzle;

  component mimcAttestation = MiMCSponge(2, 220, 1);
  mimcAttestation.ins[0] <== puzzle;
  mimcAttestation.ins[1] <== secret;
  mimcAttestation.k <== 0;
  msgAttestation <== mimcAttestation.outs[0];

  signal tempmsg;
  tempmsg <-- msg % 2;
  tempmsg * ( tempmsg - 1)===0;

}

component main {public [r,hash1,hash2,hash3,n,t,a,puzzle]}= Main();
