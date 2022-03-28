pragma solidity >0.5.0;
pragma experimental ABIEncoderV2;
import './verifier.sol';
contract Evote2
{
  Verifier verifier;
  address public admin;
  uint256[] public publickeys;
  uint256 public r;
  struct Proposal{
    uint256 count;
  }
  uint256[] public nullifiers;
  uint256[7] public inputs;
  uint256[2] public a;
  uint256[2][2] public b;
  uint256[2] public c;
  Proposal[3] proposals;
   constructor(address _v,uint256[] memory _publickeys, uint256 _r) public
   {
        publickeys=_publickeys;
        for(uint256 i=0;i<publickeys.length;i++)
        {
          inputs[3+i]=publickeys[i];
        }
        r=_r;
        verifier=Verifier(_v);
        //proposals.length=3;
   }
  function castVote(
    uint256  votemsg,
    uint256  msghash,
    uint256  nullifier,
    uint256[2] memory _a,
    uint256[2][2] memory _b,
    uint256[2] memory _c
    ) public returns(bool)
  {
        //unit[] mempry inputslist=new uint256(7);
        inputs[0]=nullifier;
        inputs[1]=msghash;
        inputs[2]=r;
        inputs[6]=votemsg;
        for(uint i=0;i<a.length;i++)
        {
          a[i]=_a[i];
        }

        for(uint i=0;i<b.length;i++)
        {
          for(uint j=0;j<_b[i].length;j++)
          {
            b[i][j]=_b[i][j];
          }
        }
        for(uint i=0;i<c.length;i++)
        {
          c[i]=_c[i];
        }
        require(verifier.verifyProof(_a,_b,_c,inputs),"Invalid Proof");
        require(!existNullifier(nullifier),"This voter has voted already.");
        proposals[votemsg-1].count++;
        nullifiers.push(nullifier);
        return true;

  }
  /* function castVote(
    uint256[7] memory inputslist,
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c
    ) public returns(bool)
  {
        //unit[] mempry inputslist=new uint256(7);
        /* inputs[0]=nullifier;
        inputs[1]=msghash;
        inputs[2]=r;
        inputs[6]=votemsg;
        require(verifier.verifyProof(a,b,c,inputslist),"Invalid Proof");
        require(!existNullifier(inputslist[0]),"This voter has voted already.");
        nullifiers.push(inputslist[0]);
        return true;

  } */

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
