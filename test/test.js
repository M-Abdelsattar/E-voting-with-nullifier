//var Verifier = artifacts.require("Verifier");
var Evote2 = artifacts.require("Evote2");
const snarkjs = require("snarkjs");
const fs = require("fs");
var bigInt = require("big-integer");
const buildMimcSponge = require("circomlibjs").buildMimcSponge;
const buildMimc7=require("circomlibjs").buildMimc7;
const {mineToBlockNumber, takeSnapshot,revertToSnapshot} = require('../helper/truffleHelper.js')
const timelockpuzzle = require('../helper/TimeLockedPuzzle.js')
const assert = require('assert');

var contractInstance;
var voteCount;

var hasheslist;
let circuit;
let mimcSponge;
let F;
let mimc7;
let F2;
function p256(n) {
    let nstr = n.toString(16);
    while (nstr.length < 64) nstr = "0"+nstr;
    nstr = `0x${nstr}`;
    return nstr;
}

// describe("MiMC Sponge Circuit test", function () {
//
//
//     this.timeout(100000);
//
//     before( async () => {
//
//     });
//     after(async () => {
//         globalThis.curve_bn128.terminate();
//     });
//
//
//     it("Should check permutation", async () => {
//
//         const out2 = mimcSponge.multiHash([123], 0, 1);
//         console.log("output:"+out2);
//
//     });
// });

contract("Evote2", async function(accounts){
    before(async () => {
        contractInstance = await Evote2.deployed();

        mimcSponge = await buildMimcSponge();
        F = mimcSponge.F;
        mimc7 = await buildMimc7();
        F2 = mimc7.F;
    })
    after(async () => {
        globalThis.curve_bn128.terminate();
    });
    describe("success states", async () => {
      it("Create a sample MiMC7",async ()=>{
        const secretHash = F2.toObject(mimc7.multiHash(['42'], 0, 1));
        console.log(secretHash.toString());
        const secretHash2 = F2.toObject(mimc7.hash("42", 0));
        console.log(secretHash2.toString());
      });
      // it("Should return valid proof (generate the proof dynamically reading inputs from a file)", async () => {
      //   const inputjson = JSON.parse(fs.readFileSync("circuits/signwithnullifier_js/input.json", "utf8"));
      //   const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputjson, "circuits/signwithnullifier_js/signwithnullifier.wasm", "circuits/signwithnullifier_js/signwithnullifier_0001.zkey");
      //   //const { proof, publicSignals } = await snarkjs.groth16.prove("circuits/signwithnullifier_js/signwithnullifier_0001.zkey","circuits/signwithnullifier_js/signwithnullifierwitness.wtns");
      //   var a1=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db5", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
      //   // var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
      //   // ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
      //   // var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
      //   // var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //   //           ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //   //           ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //   //           ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //   //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //   //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      // //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //   //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //   // var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //   // var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //   // var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0";
      //   // secretlist=[42,52,62];
      //   // hasheslist=[];
      //   // for(const secret in secretlist)
      //   // {
      //   //   const inputs=[];
      //   //   inputs.push(secret);
      //   //   const out2 = mimcSponge.multiHash(inputs, 0, 1);
      //   //
      //   //   console.log("output:"+out2+"\n");
      //   //   console.log("output:"+F.toObject(out2)+"\n");
      //   //   hasheslist.push(F.toObject(out2));
      //   // }
      //
      //   var calldataoutput=await snarkjs.groth16.exportSolidityCallData(proof,publicSignals);
      //   console.log("-----------------------------------------------------------------------------------\n");
      //
      //   console.log("calldata:"+calldataoutput+"\n");
      //
      //   console.log("-----------------------------------------------------------------------------------\n");
      //   proof.pi_a.pop();
      //   proof.pi_b.pop();
      //   proof.pi_c.pop();
      //   console.log("Proof a:"+proof.pi_a+"\n");
      //   console.log("Proof b:"+proof.pi_b+"\n");
      //   console.log("Proof c:"+proof.pi_c+"\n");
      //   console.log("public signals:"+publicSignals+"\n");
      //
      //   console.log("-----------------------------------------------------------------------------------\n");
      //   //convert the value into Hexadecimal notation.
      //   var a=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
      //   var b=[[p256(bigInt(proof.pi_b[0][1])),p256(bigInt(proof.pi_b[0][0]))],[p256(bigInt(proof.pi_b[1][1])),p256(bigInt(proof.pi_b[1][0]))]];
      //   var c=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
      //   var votemsg=p256(bigInt(publicSignals[6]));
      //   var msghash=p256(bigInt(publicSignals[1]));
      //   var nullifier=p256(bigInt(publicSignals[0]));
      //   console.log("hexstring"+proof.pi_a[0].toString(16)+"\n");
      //   console.log("a1:"+a1+"\n");
      //   console.log("a:"+a+"\n");
      //   console.log("a:"+b+"\n");
      //   console.log("a:"+c+"\n");
      //   console.log("Output:"+votemsg+"\n");
      //   console.log("Output:"+votemsg.length+"\n");
      //   console.log("Output:"+msghash+"\n");
      //   console.log("Output:"+nullifier+"\n");
      //   console.log("-----------------------------------------------------------------------------------\n");
      //
      //   // try {
      //   //   //isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //   //   isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[1],gas:20000000});
      //   //
      //   //   //isvalid=await contractInstance.castVote(publicSignals,proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[1],gas:3000000});
      //   //   console.log("isvalid:"+isvalid);
      //   //   if(isvalid)
      //   //   {
      //   //     console.log("the provided proof is valid");
      //   //
      //   //   }
      //   //   else {
      //   //     console.log("the provided proof is not valid");
      //   //
      //   //   }
      //   //   inputlist=await contractInstance.nullifiers.call(0);
      //   //   console.log("nullifiers:"+inputlist);
      //   //
      //   //
      //   //   inputlist=await contractInstance.inputs.call(0);
      //   //   console.log("inputs:"+inputlist);
      //   //   inputlist=await contractInstance.inputs.call(1);
      //   //   console.log("inputs:"+inputlist);
      //   //   inputlist=await contractInstance.inputs.call(2);
      //   //   console.log("inputs:"+inputlist);
      //   //   inputlist=await contractInstance.inputs.call(3);
      //   //   console.log("inputs:"+inputlist);
      //   //   inputlist=await contractInstance.inputs.call(4);
      //   //   console.log("inputs:"+inputlist);
      //   //   inputlist=await contractInstance.inputs.call(5);
      //   //   console.log("inputs:"+inputlist);
      //   //   inputlist=await contractInstance.inputs.call(6);
      //   //   console.log("inputs:"+inputlist);
      //   //
      //   //   inputlist=await contractInstance.a.call(0);
      //   //   inputlist2=await contractInstance.a.call(1);
      //   //   console.log("a:"+inputlist+","+inputlist2);
      //   //
      //   //   inputlist=await contractInstance.b.call(0,0);
      //   //   inputlist2=await contractInstance.b.call(0,1);
      //   //   console.log("b1:"+inputlist+","+inputlist2);
      //   //
      //   //   inputlist=await contractInstance.b.call(1,0);
      //   //   inputlist2=await contractInstance.b.call(1,1);
      //   //   console.log("b2:"+inputlist+","+inputlist2);
      //   //
      //   //   inputlist=await contractInstance.c.call(0);
      //   //   inputlist2=await contractInstance.c.call(1);
      //   //   console.log("c:"+inputlist+","+inputlist2);
      //   // } catch (e) {
      //   //   console.log(e);
      //   // } finally {
      //   //
      //   //
      //   //
      //   //
      //   // }
      //   try {
      //     isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c,{from:accounts[1],gas:3000000});
      //     //isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[0],gas:3000000});
      //
      //     console.log("isvalid:"+isvalid);
      //     if(isvalid)
      //     {
      //       console.log("the provided proof is valid");
      //
      //     }
      //     else {
      //       console.log("the provided proof is not valid");
      //
      //     }
      //     inputlist=await contractInstance.nullifiers.call(0);
      //     console.log("nullifiers:"+inputlist);
      //
      //
      //     inputlist=await contractInstance.inputs.call(0);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(1);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(2);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(3);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(4);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(5);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(6);
      //     console.log("inputs:"+inputlist);
      //
      //     inputlist=await contractInstance.a.call(0);
      //     inputlist2=await contractInstance.a.call(1);
      //     console.log("a:"+inputlist+","+inputlist2);
      //
      //     inputlist=await contractInstance.b.call(0,0);
      //     inputlist2=await contractInstance.b.call(0,1);
      //     console.log("b1:"+inputlist+","+inputlist2);
      //
      //     inputlist=await contractInstance.b.call(1,0);
      //     inputlist2=await contractInstance.b.call(1,1);
      //     console.log("b2:"+inputlist+","+inputlist2);
      //
      //     inputlist=await contractInstance.c.call(0);
      //     inputlist2=await contractInstance.c.call(1);
      //     console.log("c:"+inputlist+","+inputlist2);
      //   } catch (e) {
      //     console.log(e);
      //   } finally {
      //
      //   }
      // });
      // it("Test with generated call data (the first proof for the same inputs)", async () => {
      //   var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db5", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
      //   var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
      //   ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
      //   var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
      //   var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //             ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //             ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //             ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //   //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //   //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      // //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //   //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //   var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //   var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //   var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0";
      //   console.log("Output:"+votemsg+"\n");
      //   console.log("Output:"+votemsg.length+"\n");
      //   isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //   console.log("isvalid:"+isvalid);
      //   if(isvalid)
      //   {
      //     console.log("the provided proof is valid");
      //
      //   }
      //   else {
      //     console.log("the provided proof is not valid");
      //
      //   }
      //   console.log("isvalid:"+isvalid);
      //
      //   inputlist=await contractInstance.nullifiers.call(0);
      //   console.log("nullifiers:"+inputlist);
      //
      //
      //   inputlist=await contractInstance.inputs.call(0);
      //   console.log("inputs:"+inputlist);
      //   inputlist=await contractInstance.inputs.call(1);
      //   console.log("inputs:"+inputlist);
      //   inputlist=await contractInstance.inputs.call(2);
      //   console.log("inputs:"+inputlist);
      //   inputlist=await contractInstance.inputs.call(3);
      //   console.log("inputs:"+inputlist);
      //   inputlist=await contractInstance.inputs.call(4);
      //   console.log("inputs:"+inputlist);
      //   inputlist=await contractInstance.inputs.call(5);
      //   console.log("inputs:"+inputlist);
      //   inputlist=await contractInstance.inputs.call(6);
      //   console.log("inputs:"+inputlist);
      //
      // });
      //   it("Test with generated call data (after generate a new proof for the same inputs)", async () => {
      //     var a=["0x2bfdeadfb66b27020fb1b6c3d2b779d2ca0cd49df55d50be6101cd783ff2478b", "0x005ebb749a69a90281b31c0fdee8a5dcb41a26370a8be7beb5002a0c1fc3d954"]
      //     var b=[["0x0e67a3b6f0f32a3027cd824e8fab06febd78943064112fa371ec69d7cd42e620", "0x1dab1be08173da90a17f05317b35104d71ca97cc986baf247555464c68f4116e"],["0x0aa2dd3c4a704a22e226edac0076182414ca80a6744e17f7e0edc14b10a11b76", "0x0a1de9dd6581a59b5a9328034dbabdd9e47713d38016d9388ccbc0bb068b4a2c"]];
      //     var c=["0x2a1c20f8471a1a82925d11e44d9048cdf7eb7b7c08e76a3920c440424a88b1e8", "0x15f92f6ecd2db1c2303cc33369a319204a1b660a749b9c61fd3ec8b0e31caa66"];
      //     var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //               ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //     //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //     //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      //   //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //     //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //     var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //     var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //     var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0";
      //     console.log("Output:"+votemsg+"\n");
      //     console.log("Output:"+votemsg.length+"\n");
      //     isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //     console.log("isvalid:"+isvalid);
      //     if(isvalid)
      //     {
      //       console.log("the provided proof is valid");
      //
      //     }
      //     else {
      //       console.log("the provided proof is not valid");
      //
      //     }
      //     console.log("isvalid:"+isvalid);
      //     inputlist=await contractInstance.nullifiers.call(0);
      //     console.log("nullifiers:"+inputlist);
      //
      //
      //     inputlist=await contractInstance.inputs.call(0);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(1);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(2);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(3);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(4);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(5);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(6);
      //     console.log("inputs:"+inputlist);
      //
      //   });
        it("Should return valid proof (generate the proof dynamically)", async () => {
          snapShot = await takeSnapshot();
          snapshotId = snapShot['result'];
          var msg="1";
          var secret="42";
          var r="22";

          const secretHash = F.toObject(mimcSponge.multiHash([secret], 0, 1));
          console.log("The secret Hash value:"+secretHash+"\n");

          const { proof, publicSignals } = await snarkjs.groth16.fullProve({"r":r,
          "msg": msg,
          "secret": secret,
          "hash1":secretHash,
          "hash2":"0",
          "hash3":"0"}, "circuits/signwithnullifier_js/signwithnullifier.wasm", "circuits/signwithnullifier_js/signwithnullifier_0001.zkey");
          var calldataoutput=await snarkjs.groth16.exportSolidityCallData(proof,publicSignals);
          //console.log("-----------------------------------------------------------------------------------\n");

          // console.log("Generated calldata:"+calldataoutput+"\n");

        //  console.log("-----------------------------------------------------------------------------------\n");
          proof.pi_a.pop();
          proof.pi_b.pop();
          proof.pi_c.pop();
          // console.log("Proof a:"+proof.pi_a+"\n");
          // console.log("Proof b:"+proof.pi_b+"\n");
          // console.log("Proof c:"+proof.pi_c+"\n");
          // console.log("public signals:"+publicSignals+"\n");
          console.log("-----------------------------------------------------------------------------------\n");
          console.log("--------------------------------The values to be sent------------------------------\n");
          console.log("-----------------------------------------------------------------------------------\n");
          //convert the value into Hexadecimal notation.
          var a=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
          var b=[[p256(bigInt(proof.pi_b[0][1])),p256(bigInt(proof.pi_b[0][0]))],[p256(bigInt(proof.pi_b[1][1])),p256(bigInt(proof.pi_b[1][0]))]];
          var c=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
          var votemsg=p256(bigInt(publicSignals[6]));
          var msghash=p256(bigInt(publicSignals[1]));
          var nullifier=p256(bigInt(publicSignals[0]));
          console.log("Proof a:"+a+"\n");
          console.log("Proof b:"+b+"\n");
          console.log("Proof c:"+c+"\n");
          console.log("Message:"+votemsg+"\n");
          console.log("Message's hash:"+msghash+"\n");
          console.log("Nullifier:"+nullifier+"\n");
          console.log("-----------------------------------------------------------------------------------\n");

          try {
            isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c,{from:accounts[1],gas:3000000});
            //isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[0],gas:3000000});

            // console.log("The received values to the smart contract:");
            // inputlist=await contractInstance.nullifiers.call(0);
            // console.log("nullifiers:"+inputlist);

          } catch (e) {
            console.log(e);
          } finally {

          }



          await revertToSnapshot(snapshotId);

        });
        it("Should return the voter has voted already (generate the proof dynamically)", async () => {
          snapShot = await takeSnapshot();
          snapshotId = snapShot['result'];

          var msg="2";
          var secret="42";
          var r="22";

          const secretHash = F.toObject(mimcSponge.multiHash([secret], 0, 1));
          console.log("The secret Hash value:"+secretHash+"\n");

          const { proof, publicSignals } = await snarkjs.groth16.fullProve({"r":r,
          "msg": msg,
          "secret": secret,
          "hash1":secretHash,
          "hash2":"0",
          "hash3":"0"}, "circuits/signwithnullifier_js/signwithnullifier.wasm", "circuits/signwithnullifier_js/signwithnullifier_0001.zkey");
          var calldataoutput=await snarkjs.groth16.exportSolidityCallData(proof,publicSignals);
          // console.log("-----------------------------------------------------------------------------------\n");
          //
          // console.log("Generated calldata:"+calldataoutput+"\n");
          //
          // console.log("-----------------------------------------------------------------------------------\n");
          proof.pi_a.pop();
          proof.pi_b.pop();
          proof.pi_c.pop();
          // console.log("Proof a:"+proof.pi_a+"\n");
          // console.log("Proof b:"+proof.pi_b+"\n");
          // console.log("Proof c:"+proof.pi_c+"\n");
          // console.log("public signals:"+publicSignals+"\n");
          console.log("-----------------------------------------------------------------------------------\n");
          console.log("--------------------------------The values to be sent------------------------------\n");
          console.log("-----------------------------------------------------------------------------------\n");
          //convert the value into Hexadecimal notation.
          var a=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
          var b=[[p256(bigInt(proof.pi_b[0][1])),p256(bigInt(proof.pi_b[0][0]))],[p256(bigInt(proof.pi_b[1][1])),p256(bigInt(proof.pi_b[1][0]))]];
          var c=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
          var votemsg=p256(bigInt(publicSignals[6]));
          var msghash=p256(bigInt(publicSignals[1]));
          var nullifier=p256(bigInt(publicSignals[0]));
          console.log("Proof a:"+a+"\n");
          console.log("Proof b:"+b+"\n");
          console.log("Proof c:"+c+"\n");
          console.log("Message:"+votemsg+"\n");
          console.log("Message's hash:"+msghash+"\n");
          console.log("Nullifier:"+nullifier+"\n");
          console.log("-----------------------------------------------------------------------------------\n");

          try {
            isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c,{from:accounts[1],gas:3000000});

            isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c,{from:accounts[1],gas:3000000});
            //isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[0],gas:3000000});

            // console.log("The received values to the smart contract:");
            // inputlist=await contractInstance.nullifiers.call(0);
            // console.log("nullifiers:"+inputlist);
            //
            //
            // inputlist=await contractInstance.inputs.call(0);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(1);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(2);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(3);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(4);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(5);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(6);
            // console.log("inputs:"+inputlist);
          } catch (e) {

            assert(String(e).includes("voter has voted already"), "The voter has voted already")
          } finally {

          }



          await revertToSnapshot(snapshotId);

        });
      //   it("Should return valid proof (load the proof from the generated file)", async () => {
      //     // const { proof, publicSignals } = await snarkjs.groth16.fullProve({r:22,
      //     // msg: 123,
      //     // secret: 42,
      //     // hash1:"10644022205700269842939357604110603061463166818082702766765548366499887869490",
      //     // hash2:"0",
      //     // hash3:"0"}, "test/signwithnullifier.wasm", "test/signwithnullifier_0001.zkey");
      //     const proof = JSON.parse(fs.readFileSync("circuits/signwithnullifier_js/proof.json", "utf8"));
      //     const publicSignals= JSON.parse(fs.readFileSync("circuits/signwithnullifier_js/public.json", "utf8"));
      //     //const { proof, publicSignals } = await snarkjs.groth16.fullProve("test/signwithnullifier_0001.zkey","test/witness.wtns");
      //     var a1=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db5", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
      //     // var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
      //     // ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
      //     // var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
      //     // var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //     //           ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //     //           ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //     //           ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //     //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //     //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      //   //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //     //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //     // var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //     // var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //     // var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0";
      //     var calldataoutput=await snarkjs.groth16.exportSolidityCallData(proof,publicSignals);
      //     console.log("-----------------------------------------------------------------------------------\n");
      //
      //     console.log("calldata:"+calldataoutput+"\n");
      //
      //     console.log("-----------------------------------------------------------------------------------\n");
      //     proof.pi_a.pop();
      //     proof.pi_b.pop();
      //     proof.pi_c.pop();
      //     console.log("Proof a:"+proof.pi_a+"\n");
      //     console.log("Proof b:"+proof.pi_b+"\n");
      //     console.log("Proof c:"+proof.pi_c+"\n");
      //     console.log("public signals:"+publicSignals+"\n");
      //
      //     console.log("-----------------------------------------------------------------------------------\n");
      //     //convert the value into Hexadecimal notation.
      //     var a=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
      //     var b=[[p256(bigInt(proof.pi_b[0][0])),p256(bigInt(proof.pi_b[0][1]))],[p256(bigInt(proof.pi_b[1][0])),p256(bigInt(proof.pi_b[1][1]))]];
      //     var c=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
      //     var votemsg=p256(bigInt(publicSignals[6]));
      //     var msghash=p256(bigInt(publicSignals[1]));
      //     var nullifier=p256(bigInt(publicSignals[0]));
      //     console.log("hexstring"+proof.pi_a[0].toString(16)+"\n");
      //     console.log("a1:"+a1+"\n");
      //     console.log("a:"+a+"\n");
      //     console.log("a:"+b+"\n");
      //     console.log("a:"+c+"\n");
      //     console.log("Output:"+votemsg+"\n");
      //     console.log("Output:"+votemsg.length+"\n");
      //     console.log("Output:"+msghash+"\n");
      //     console.log("Output:"+nullifier+"\n");
      //     console.log("-----------------------------------------------------------------------------------\n");
      //
      //     try {
      //       //isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //       isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[1],gas:20000000});
      //
      //       //isvalid=await contractInstance.castVote(publicSignals,proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[1],gas:3000000});
      //       console.log("isvalid:"+isvalid);
      //       if(isvalid)
      //       {
      //         console.log("the provided proof is valid");
      //
      //       }
      //       else {
      //         console.log("the provided proof is not valid");
      //
      //       }
      //     } catch (e) {
      //       console.log(e);
      //     } finally {
      //
      //       inputlist=await contractInstance.nullifiers.call(0);
      //       console.log("nullifiers:"+inputlist);
      //
      //
      //       inputlist=await contractInstance.inputs.call(0);
      //       console.log("inputs:"+inputlist);
      //       inputlist=await contractInstance.inputs.call(1);
      //       console.log("inputs:"+inputlist);
      //       inputlist=await contractInstance.inputs.call(2);
      //       console.log("inputs:"+inputlist);
      //       inputlist=await contractInstance.inputs.call(3);
      //       console.log("inputs:"+inputlist);
      //       inputlist=await contractInstance.inputs.call(4);
      //       console.log("inputs:"+inputlist);
      //       inputlist=await contractInstance.inputs.call(5);
      //       console.log("inputs:"+inputlist);
      //       inputlist=await contractInstance.inputs.call(6);
      //       console.log("inputs:"+inputlist);
      //
      //     }
      //     try {
      //       isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c,{from:accounts[1],gas:3000000});
      //       //isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[0],gas:3000000});
      //
      //       console.log("isvalid:"+isvalid);
      //       if(isvalid)
      //       {
      //         console.log("the provided proof is valid");
      //
      //       }
      //       else {
      //         console.log("the provided proof is not valid");
      //
      //       }
      //     } catch (e) {
      //       console.log(e);
      //     } finally {
      //
      //     }
      //
      //
      //
      //
      //
      //   });
      //
      //
      //   it("Should return this voter has voted already", async () => {
      //     var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db5", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
      //     var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
      //     ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
      //     var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
      //     var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //               ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //     //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //     //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      //   //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //     //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //     var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //     var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //     var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0";
      //     console.log("Output:"+votemsg+"\n");
      //     console.log("Output:"+votemsg.length+"\n");
      //     isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //     console.log("isvalid:"+isvalid);
      //     if(isvalid)
      //     {
      //       console.log("the provided proof is valid");
      //
      //     }
      //     else {
      //       console.log("the provided proof is not valid");
      //
      //     }
      //     console.log("isvalid:"+isvalid);
      //     isvalid2=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //     if(isvalid2)
      //     {
      //       console.log("the provided proof is valid");
      //
      //     }
      //     else {
      //       console.log("the provided proof is not valid");
      //
      //     }
      //
      //
      //
      //
      //   });
        it("Should return invalid proof (invalid nullifier)", async () => {
          snapShot = await takeSnapshot();
          snapshotId = snapShot['result'];

          var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db5", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
          var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
          ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
          var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
          var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
                    ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
                    ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
                    ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
          //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
          //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
        //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
          //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];

          var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
          var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
          var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d1";
          console.log("Output:"+votemsg+"\n");
          console.log("Output:"+votemsg.length+"\n");
          try {

          isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);

          // inputlist=await contractInstance.nullifiers.call(0);
          // console.log("nullifiers:"+inputlist);
          //
          // inputlist=await contractInstance.inputs.call(0);
          // console.log("inputs:"+inputlist);
          // inputlist=await contractInstance.inputs.call(1);
          // console.log("inputs:"+inputlist);
          // inputlist=await contractInstance.inputs.call(2);
          // console.log("inputs:"+inputlist);
          // inputlist=await contractInstance.inputs.call(3);
          // console.log("inputs:"+inputlist);
          // inputlist=await contractInstance.inputs.call(4);
          // console.log("inputs:"+inputlist);
          // inputlist=await contractInstance.inputs.call(5);
          // console.log("inputs:"+inputlist);
          // inputlist=await contractInstance.inputs.call(6);
          // console.log("inputs:"+inputlist);

        } catch (e) {
          assert(String(e).includes("Invalid Proof"), "Invalid Proof");
        } finally {

        }




          await revertToSnapshot(snapshotId);
        });
        it("Should return invalid proof (invalid msghash)", async () => {
          snapShot = await takeSnapshot();
          snapshotId = snapShot['result'];

          var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db5", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
          var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
          ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
          var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
          var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
                    ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
                    ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
                    ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
          //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
          //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
        //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
          //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];

          var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
          var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
          var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d1";
          console.log("Output:"+votemsg+"\n");
          console.log("Output:"+votemsg.length+"\n");
          try {

            isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);

            // inputlist=await contractInstance.nullifiers.call(0);
            // console.log("nullifiers:"+inputlist);
            //
            // inputlist=await contractInstance.inputs.call(0);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(1);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(2);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(3);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(4);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(5);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(6);
            // console.log("inputs:"+inputlist);
          } catch (e) {
            assert(String(e).includes("Invalid Proof"), "Invalid Proof");
          } finally {

          }


          await revertToSnapshot(snapshotId);
        });
        it("Should return invalid proof (invalid msg)", async () => {
          snapShot = await takeSnapshot();
          snapshotId = snapShot['result'];

          var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db5", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
          var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
          ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
          var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
          var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
                    ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
                    ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
                    ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
          //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
          //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
        //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
          //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];

          var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
          var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
          var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d1";
          console.log("Output:"+votemsg+"\n");
          console.log("Output:"+votemsg.length+"\n");
          try {

            isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);

            // inputlist=await contractInstance.nullifiers.call(0);
            // console.log("nullifiers:"+inputlist);
            //
            //
            // inputlist=await contractInstance.inputs.call(0);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(1);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(2);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(3);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(4);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(5);
            // console.log("inputs:"+inputlist);
            // inputlist=await contractInstance.inputs.call(6);
            // console.log("inputs:"+inputlist);

          } catch (e) {
            assert(String(e).includes("Invalid Proof"), "Invalid Proof");
          } finally {

          }


          await revertToSnapshot(snapshotId);


        });
      //   it("Should return invalid proof (invalid proof part a)", async () => {
      //     var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db0", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
      //     var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
      //     ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
      //     var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
      //     var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //               ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //     //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //     //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      //   //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //     //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //     var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //     var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //     var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d1";
      //     console.log("Output:"+votemsg+"\n");
      //     console.log("Output:"+votemsg.length+"\n");
      //     isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //     if(isvalid)
      //     {
      //       console.log("the provided proof is valid");
      //
      //     }
      //     else {
      //       console.log("the provided proof is not valid");
      //
      //     }
      //
      //     inputlist=await contractInstance.nullifiers.call(0);
      //     console.log("nullifiers:"+inputlist);
      //
      //
      //     inputlist=await contractInstance.inputs.call(0);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(1);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(2);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(3);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(4);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(5);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(6);
      //     console.log("inputs:"+inputlist);
      //
      //
      //
      //   });
      //   it("Should return invalid proof (invalid proof part b)", async () => {
      //     var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db0", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
      //     var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021710", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
      //     ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
      //     var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69af","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
      //     var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //               ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //     //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //     //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      //   //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //     //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //     var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //     var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //     var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d1";
      //     console.log("Output:"+votemsg+"\n");
      //     console.log("Output:"+votemsg.length+"\n");
      //     isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //     if(isvalid)
      //     {
      //       console.log("the provided proof is valid");
      //
      //     }
      //     else {
      //       console.log("the provided proof is not valid");
      //
      //     }
      //
      //
      //     inputlist=await contractInstance.nullifiers.call(0);
      //     console.log("nullifiers:"+inputlist);
      //
      //     inputlist=await contractInstance.inputs.call(0);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(1);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(2);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(3);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(4);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(5);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(6);
      //     console.log("inputs:"+inputlist);
      //
      //
      //   });
      //   it("Should return invalid proof (invalid proof part c)", async () => {
      //     var a=["0x1aa03fa7dad09ba69be52f561b6e43eb24583c0291bd3173c2f88b51bfea8db0", "0x064f3aeaeb9300888eca36d723f8c369e4991709af9817e4723e040d9ac54492"]
      //     var b=[["0x2ffa71c69eec2f772e268415890decc3c8037f73df87a4ce08dc90f9ce021715", "0x12b629b4444770a61c078cb4e885dfe2b899f0aaa5d3227c7e5a597a57c59c06"]
      //     ,["0x014bba872b6bb7a690954a62048b0f8959127f4c94395c2f55355f0c269e9b70", "0x04bddc1058cc90d9177cbfb45e3a1bbb973d5db9289fd420d723a2b6befd8717"]];
      //     var c=["0x1e53da32293bcdafd521d27f030d23dd89918a1a337ec019aff46ae9cf9b69a0","0x0ed00bd4bd9b4e5ed67d2aba4c0c26422fb43b09af0d5c39335ba00eb63a2b86"];
      //     var input=["0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d0","0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000016","0x17884d9655993ab784fd4836427e8cf15d36dcc61a9583bafd1f79e6c71e6e32"
      //               ,"0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000000"
      //               ,"0x000000000000000000000000000000000000000000000000000000000000007b"];
      //     //var a=["0x2e7a526941e90ed504129fc87853933ab0f32ef5d831d4fd9922b6dc34ce08e9", "0x0f6b00325bba62b5473095e938e05b74f5e25ef5273c40bbd8b8658026da4483"];
      //     //var b=[["0x053ceba623fb617b990d33ea96ad25da2767a1c70a802ecdc68c1fcb351c9b7e", "0x2acbe24b6f47db456801604a39261e90db1bd38811b7c907d22804c7b08b9b9d"],["0x222d75cf21a2a16a7fb15841c72095c5d602442c19d8f828292f303520056a07", "0x036656c3dbe5d3fea56a6c102a53c39496e6bbf3332e8a345fbff22f0b4d743f"]];
      //   //  var c=["0x1dd118575fd08bcd03c5df74b3ab741ac28be99c96f0e3e587954ddcc21f9a45", "0x0840701fb60055b3652c21c18d33c9518af745b33ac0a1849ce62dd0c1dc2bad"];
      //     //var input=["0x0000000000000000000000000000000000000000000000000000000000000021"];
      //
      //     var votemsg="0x000000000000000000000000000000000000000000000000000000000000007b";
      //     var msghash="0x17276340fe9ee9cf8687ab93e4fe970a1af4fd88d118be3124b280c2ce97e38c";
      //     var nullifier="0x2abbaae9875a300b72b9ad75d044e9d2580c54cbe2f4a82d5d7346c2acf117d1";
      //     console.log("Output:"+votemsg+"\n");
      //     console.log("Output:"+votemsg.length+"\n");
      //     isvalid=await contractInstance.castVote(votemsg,msghash,nullifier,a,b,c);
      //     if(isvalid)
      //     {
      //       console.log("the provided proof is valid");
      //
      //     }
      //     else {
      //       console.log("the provided proof is not valid");
      //
      //     }
      //
      //
      //     inputlist=await contractInstance.nullifiers.call(0);
      //     console.log("nullifiers:"+inputlist);
      //
      //     inputlist=await contractInstance.inputs.call(0);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(1);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(2);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(3);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(4);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(5);
      //     console.log("inputs:"+inputlist);
      //     inputlist=await contractInstance.inputs.call(6);
      //     console.log("inputs:"+inputlist);
      //
      //
      //   });




    })
})
