pragma solidity >0.5.0;
pragma experimental ABIEncoderV2;
import './verifier.sol';
import './votevalueverifier.sol';
contract Evote2
{
  struct Proposal{
    uint256 count;
  }
  struct ProofData{
    uint256 a0;
    uint256 a1;
    uint256 b00;
    uint256 b01;
    uint256 b10;
    uint256 b11;
    uint256 c0;
    uint256 c1;
  }
  struct TLPParameters{
    uint256 n;
    uint256 t;
    uint256 a;
  }
  struct CommitmentPair{
    uint256 votemsghash;
    uint256 d;
  }

  Verifier verifier;
  VoteValueVerifier v_v_verifier;
  address public admin;
  uint256[] public publickeys;
  uint256 public r;

  uint256[] public nullifiers;
  uint256[10] public inputs;

  Proposal[1] public proposals;
  uint256[] public votesvalueshashes;
  ProofData[] public votesvaluesproofs;
  //mapping(uint256=>ProofData) public votesvaluesproofs;

  TLPParameters[] public votesTLPParameters;
  uint256[] public encryptedmsgs;

  constructor(address _vaddress,address _votevalueverifieraddress,uint256[] memory _publickeys, uint256 _r) public
   {
        publickeys=_publickeys;
        for(uint256 i=0;i<publickeys.length;i++)
        {
          inputs[3+i]=publickeys[i];
        }
        r=_r;
        verifier=Verifier(_vaddress);
        v_v_verifier=VoteValueVerifier(_votevalueverifieraddress);
        //proposals.length=3;
   }
   function getProposalCount(uint i) public returns(uint256)
   {
     return proposals[i].count;
   }
   function getProof(uint i) public returns(uint256)
   {
     return votesvaluesproofs[i].a0;
   }
   function getVoteTLPN(uint i) public returns(uint256)
   {
     return votesTLPParameters[i].n;
   }
   function getVoteTLPA(uint i) public returns(uint256)
   {
     return votesTLPParameters[i].a;
   }
   function getVoteTLPT(uint i) public returns(uint256)
   {
     return votesTLPParameters[i].t;
   }
   function castVote(
     uint256  encryptedvotemsg,
     uint256  encryptedvotemsghash,
     uint256  votemsghash,
     uint256  nullifier,
     uint256  n,
     uint256  t,
     uint256  a,
     uint256[8] memory proof,
     uint256[8] memory valueproof

     ) public returns(bool)
   {

         inputs[0]=nullifier;
         inputs[1]=encryptedvotemsghash;
         inputs[2]=r;
         inputs[6]=n;
         inputs[7]=t;
         inputs[8]=a;
         inputs[9]=encryptedvotemsg;
         uint256[2] memory proof_a=[proof[0],proof[1]];
         uint256[2][2] memory proof_b=[[proof[2],proof[3]],[proof[4],proof[5]]];
         uint256[2] memory proof_c=[proof[6],proof[7]];
         require(verifier.verifyProof(proof_a,proof_b,proof_c,inputs),"Invalid Proof");
         require(!existNullifier(nullifier),"This voter has voted already.");

         nullifiers.push(nullifier);
         encryptedmsgs.push(encryptedvotemsg);
         votesTLPParameters.push(TLPParameters(n,t,a));
         /* votesvaluesproofs.push(ProofData(valueproof_a[0],valueproof_a[1],valueproof_b[0][0],
         valueproof_b[0][1],valueproof_b[1][0],valueproof_b[1][1],valueproof_c[0],valueproof_c[1])); */

         votesvaluesproofs.push(ProofData(valueproof[0],valueproof[1],valueproof[2],
         valueproof[3],valueproof[4],valueproof[5],valueproof[6],valueproof[7]));

         //votesvaluesproofs[nullifier]=ProofData(valueproof_a,valueproof_b,valueproof_c);
         votesvalueshashes.push(votemsghash);
         return true;

   }
   function submitPuzzleSolution(uint256 i,uint256 m) public returns(bool)
   {
     uint256[2] memory input=[votesvalueshashes[i],m];
     //input[0]=;
     //input[1]=m;
     ProofData memory votevalueproof=votesvaluesproofs[i];
     uint256[2] memory a=[votevalueproof.a0,votevalueproof.a1];
     uint256[2][2] memory b=[[votevalueproof.b00,votevalueproof.b01],[votevalueproof.b10,votevalueproof.b11]];
     uint256[2] memory c=[votevalueproof.c0,votevalueproof.c1];

     /* a[0]=votevalueproof.a0;
     a[1]=votevalueproof.a1;

     b[0][0]=votevalueproof.b00;
     b[0][1]=votevalueproof.b01;
     b[1][0]=votevalueproof.b10;
     b[1][1]=votevalueproof.b11;

     c[0]=votevalueproof.c0;
     c[1]=votevalueproof.c1; */

     require(v_v_verifier.verifyProof(a,b,c,input),"Invalid vote value Proof");
     proposals[0].count++;
     return true;
   }

  function existNullifier(uint256 nullifier) internal returns(bool)
  {
      for(uint256 i=0;i<nullifiers.length;i++)
      {
        if(nullifier==nullifiers[i])
          return true;
      }
      return false;
  }
}
