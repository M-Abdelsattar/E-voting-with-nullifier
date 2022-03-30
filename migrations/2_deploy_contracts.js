const Verifier=artifacts.require("Verifier");
const VoteValueVerifier=artifacts.require("VoteValueVerifier");
const Evote2=artifacts.require("Evote2");

module.exports=function(deployer)
{

  var pub_keys=["0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32","0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"];
  var r="0x0000000000000000000000000000000000000000000000000000000000000016";
  deployer.deploy(Verifier).then(function(){
    return deployer.deploy(VoteValueVerifier).then(function(){
       return deployer.deploy(Evote2,Verifier.address,VoteValueVerifier.address,pub_keys,r);
     });
  });
}
