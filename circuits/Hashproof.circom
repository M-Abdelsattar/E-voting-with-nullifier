pragma circom 2.0.3;
include "../circomlib/circuits/mimcsponge.circom";
template HashProof()
{

signal input msg;
signal input d;
signal output hash;

component mimcAttestation = MiMCSponge(2, 220, 1);
mimcAttestation.ins[0] <== msg;
mimcAttestation.ins[1] <== d;
mimcAttestation.k <== 0;
hash <== mimcAttestation.outs[0];

}

component main =HashProof();
