//var Verifier = artifacts.require("Verifier");
var Evote2 = artifacts.require("Evote2");
const snarkjs = require("snarkjs");
const snarkjs2 = require("snarkjs");
const fs = require("fs");
var bigInt = require("big-integer");
const buildMimcSponge = require("circomlibjs").buildMimcSponge;
const buildMimc7=require("circomlibjs").buildMimc7;
const {mineToBlockNumber, takeSnapshot,revertToSnapshot} = require('../helper/truffleHelper.js')
const {findM,reverseMsg,generateTLPuzzle,solveTLPuzzle,calculateS} = require('../helper/TimeLockedPuzzle.js')
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
      it("Test",async ()=>{
        const { proof, publicSignals } = await snarkjs.groth16.fullProve({"msg": "1",
        "d": "25252525"}, "circuits/hashproof_js/hashproof.wasm", "circuits/hashproof_js/hashproof_0001.zkey");
        //console.log("-----------------------------------------------------------------------------------\n");

        // console.log("Generated calldata:"+calldataoutput+"\n");

      //  console.log("-----------------------------------------------------------------------------------\n");
        console.log("Value proof:"+JSON.stringify(proof));
        console.log("Value proof:"+publicSignals);

      });
      it("Should return valid proof (generate the proof dynamically)", async () => {
        snapShot = await takeSnapshot();
        snapshotId = snapShot['result'];
        var msg="1";
        var secret="42";
        var r="22";
        //calculate the secretHash
        const secretHash = F.toObject(mimcSponge.multiHash([secret], 0, 1));
        console.log("The secret Hash value:"+secretHash+"\n");

        //calculate the message shadow
        var msgshadow=findM(BigInt(1),32);

        //calculate the TLP
        const [encryptedmsg,a,t,n,p,q,phi]=await generateTLPuzzle(msgshadow,2,1,32);

        console.log("Message Shadow:"+msgshadow+"\n");
        console.log("encryptedmsg:"+encryptedmsg+"\n");
        console.log("a:"+a+"\n");
        console.log("n:"+n+"\n");
        console.log("phi:"+phi+"\n");
        console.log("t:"+t+"\n");
        console.log("Message Shadow:"+msgshadow.toString()+"\n");
        console.log("encryptedmsg:"+encryptedmsg.toString()+"\n");
        console.log("a:"+a.toString()+"\n");
        console.log("n:"+n.toString()+"\n");
        console.log("phi:"+phi.toString()+"\n");
        console.log("t:"+t.toString()+"\n");



        //callculate the vote wellformed proof
        var { proof, publicSignals } = await snarkjs.groth16.fullProve({"r":r,
        "msg": msgshadow.toString(),
        "secret": secret,
        "hash1":secretHash,
        "hash2":"0",
        "hash3":"0",
        "n":n.toString(),
        "phi":phi.toString(),
        "t":t.toString(),
        "a":a.toString(),
        "puzzle":encryptedmsg.toString()}, "circuits/signwithnullifier_js/signwithnullifier.wasm", "circuits/signwithnullifier_js/signwithnullifier_0001.zkey");
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve({"r":r,
        // "msg":"4170284213",
        // "secret": secret,
        // "hash1":secretHash,
        // "hash2":"0",
        // "hash3":"0",
        // "n":"15261306157560691511",
        // "phi":"15261306149746860624",
        // "t":"2",
        // "a":"4723127563061513173",
        // "puzzle":"12595920226896279948"}, "circuits/signwithnullifier_js/signwithnullifier.wasm", "circuits/signwithnullifier_js/signwithnullifier_0001.zkey");
        proof.pi_a.pop();
        proof.pi_b.pop();
        proof.pi_c.pop();

        var a1=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
        var b1=[[p256(bigInt(proof.pi_b[0][1])),p256(bigInt(proof.pi_b[0][0]))],[p256(bigInt(proof.pi_b[1][1])),p256(bigInt(proof.pi_b[1][0]))]];
        var c1=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
        var prooflist=[a1[0],a1[1],b1[0][0],b1[0][1],b1[1][0],b1[1][1],c1[0],c1[1]];
        var nullifier=p256(bigInt(publicSignals[0]));
        var encryptedmsghash=p256(bigInt(publicSignals[1]));
        //calculate the votevalue proof
        var { proof, publicSignals } = await snarkjs.groth16.fullProve({"msg": msg,
        "d": secret}, "circuits/Hashproof_js/Hashproof.wasm", "circuits/Hashproof_js/hashproof_0001.zkey");
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve({"msg": "1",
        // "d": "100"}, "circuits/hashproof_js/hashproof.wasm", "circuits/hashproof_js/hashproof_0001.zkey");
        //console.log("-----------------------------------------------------------------------------------\n");

        // console.log("Generated calldata:"+calldataoutput+"\n");

      //  console.log("-----------------------------------------------------------------------------------\n");
        console.log("Value proof:"+JSON.stringify(proof));
        console.log("Value proof:"+publicSignals);


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


        var a2=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
        var b2=[[p256(bigInt(proof.pi_b[0][1])),p256(bigInt(proof.pi_b[0][0]))],[p256(bigInt(proof.pi_b[1][1])),p256(bigInt(proof.pi_b[1][0]))]];
        var c2=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
        var valueprooflist=[a2[0],a2[1],b2[0][0],b2[0][1],b2[1][0],b2[1][1],c2[0],c2[1]];
        var votevaluehash=p256(bigInt(publicSignals[0]))

        console.log("Proof a:"+a1+"\n");
        console.log("Proof b:"+b1+"\n");
        console.log("Proof c:"+c1+"\n");
        console.log("Proof a2:"+a2+"\n");
        console.log("Proof b2:"+b2+"\n");
        console.log("Proof c2:"+c2+"\n");
        console.log("Message's hash:"+votevaluehash+"\n");
        console.log("EncMessage's hash:"+encryptedmsghash+"\n");
        console.log("Nullifier:"+nullifier+"\n");
        console.log("-----------------------------------------------------------------------------------\n");

        try {
          //isvalid=await contractInstance.castVote(encryptedmsg,encryptedmsghash,votevaluehash,nullifier,n,t,a,a1,b1,c1,a2,b2,c2,{from:accounts[1],gas:3000000});
          isvalid=await contractInstance.castVote(encryptedmsg,encryptedmsghash,votevaluehash,nullifier,n,t,a,prooflist,valueprooflist,{from:accounts[1],gas:3000000});

          //isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[0],gas:3000000});
          var r_proofa0=await contractInstance.getProof.call(0);
          console.log("r_proofa0:"+r_proofa0);
          var r_encryptedmsg=await contractInstance.encryptedmsgs.call(0);
          var r_n=await contractInstance.getVoteTLPN.call(0);
          var r_a=await contractInstance.getVoteTLPA.call(0);
          var r_t=await contractInstance.getVoteTLPT.call(0);
          console.log("r_encryptedmsg:"+r_encryptedmsg);
          console.log("r_n:"+r_n);
          console.log("r_a:"+r_a);
          console.log("r_t:"+r_t);
          var r_m=await solveTLPuzzle(BigInt(r_encryptedmsg),BigInt(r_a),BigInt(r_t),BigInt(r_n));
          console.log("r_m:"+r_m);
          var reversedmsg=reverseMsg(r_m);
          console.log("r_m%2:"+reversedmsg);

          var result=await contractInstance.submitPuzzleSolution(0,reversedmsg,{from:accounts[2],gas:3000000});
          var proposalcount=await contractInstance.getProposalCount.call(0);
          console.log("Count:"+proposalcount);
           // console.log("The received values to the smart contract:");
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);


        } catch (e) {
          console.log(e);
        } finally {

        }



        await revertToSnapshot(snapshotId);

      });
      it("Should return invalid vote value (The puzzle solver change the vote value)", async () => {
        snapShot = await takeSnapshot();
        snapshotId = snapShot['result'];
        var msg="1";
        var secret="42";
        var r="22";
        //calculate the secretHash
        const secretHash = F.toObject(mimcSponge.multiHash([secret], 0, 1));
        console.log("The secret Hash value:"+secretHash+"\n");

        //calculate the message shadow
        var msgshadow=findM(BigInt(1),32);

        //calculate the TLP
        const [encryptedmsg,a,t,n,p,q,phi]=await generateTLPuzzle(msgshadow,2,1,32);

        console.log("Message Shadow:"+msgshadow+"\n");
        console.log("encryptedmsg:"+encryptedmsg+"\n");
        console.log("a:"+a+"\n");
        console.log("n:"+n+"\n");
        console.log("phi:"+phi+"\n");
        console.log("t:"+t+"\n");
        console.log("Message Shadow:"+msgshadow.toString()+"\n");
        console.log("encryptedmsg:"+encryptedmsg.toString()+"\n");
        console.log("a:"+a.toString()+"\n");
        console.log("n:"+n.toString()+"\n");
        console.log("phi:"+phi.toString()+"\n");
        console.log("t:"+t.toString()+"\n");



        //callculate the vote wellformed proof
        var { proof, publicSignals } = await snarkjs.groth16.fullProve({"r":r,
        "msg": msgshadow.toString(),
        "secret": secret,
        "hash1":secretHash,
        "hash2":"0",
        "hash3":"0",
        "n":n.toString(),
        "phi":phi.toString(),
        "t":t.toString(),
        "a":a.toString(),
        "puzzle":encryptedmsg.toString()}, "circuits/signwithnullifier_js/signwithnullifier.wasm", "circuits/signwithnullifier_js/signwithnullifier_0001.zkey");
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve({"r":r,
        // "msg":"4170284213",
        // "secret": secret,
        // "hash1":secretHash,
        // "hash2":"0",
        // "hash3":"0",
        // "n":"15261306157560691511",
        // "phi":"15261306149746860624",
        // "t":"2",
        // "a":"4723127563061513173",
        // "puzzle":"12595920226896279948"}, "circuits/signwithnullifier_js/signwithnullifier.wasm", "circuits/signwithnullifier_js/signwithnullifier_0001.zkey");
        proof.pi_a.pop();
        proof.pi_b.pop();
        proof.pi_c.pop();

        var a1=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
        var b1=[[p256(bigInt(proof.pi_b[0][1])),p256(bigInt(proof.pi_b[0][0]))],[p256(bigInt(proof.pi_b[1][1])),p256(bigInt(proof.pi_b[1][0]))]];
        var c1=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
        var prooflist=[a1[0],a1[1],b1[0][0],b1[0][1],b1[1][0],b1[1][1],c1[0],c1[1]];
        var nullifier=p256(bigInt(publicSignals[0]));
        var encryptedmsghash=p256(bigInt(publicSignals[1]));
        //calculate the votevalue proof
        var { proof, publicSignals } = await snarkjs.groth16.fullProve({"msg": msg,
        "d": secret}, "circuits/Hashproof_js/Hashproof.wasm", "circuits/Hashproof_js/hashproof_0001.zkey");
        // const { proof, publicSignals } = await snarkjs.groth16.fullProve({"msg": "1",
        // "d": "100"}, "circuits/hashproof_js/hashproof.wasm", "circuits/hashproof_js/hashproof_0001.zkey");
        //console.log("-----------------------------------------------------------------------------------\n");

        // console.log("Generated calldata:"+calldataoutput+"\n");

      //  console.log("-----------------------------------------------------------------------------------\n");
        console.log("Value proof:"+JSON.stringify(proof));
        console.log("Value proof:"+publicSignals);


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


        var a2=[p256(bigInt(proof.pi_a[0])),p256(bigInt(proof.pi_a[1]))];
        var b2=[[p256(bigInt(proof.pi_b[0][1])),p256(bigInt(proof.pi_b[0][0]))],[p256(bigInt(proof.pi_b[1][1])),p256(bigInt(proof.pi_b[1][0]))]];
        var c2=[p256(bigInt(proof.pi_c[0])),p256(bigInt(proof.pi_c[1]))];
        var valueprooflist=[a2[0],a2[1],b2[0][0],b2[0][1],b2[1][0],b2[1][1],c2[0],c2[1]];
        var votevaluehash=p256(bigInt(publicSignals[0]))

        console.log("Proof a:"+a1+"\n");
        console.log("Proof b:"+b1+"\n");
        console.log("Proof c:"+c1+"\n");
        console.log("Proof a2:"+a2+"\n");
        console.log("Proof b2:"+b2+"\n");
        console.log("Proof c2:"+c2+"\n");
        console.log("Message's hash:"+votevaluehash+"\n");
        console.log("EncMessage's hash:"+encryptedmsghash+"\n");
        console.log("Nullifier:"+nullifier+"\n");
        console.log("-----------------------------------------------------------------------------------\n");

        try {
          //isvalid=await contractInstance.castVote(encryptedmsg,encryptedmsghash,votevaluehash,nullifier,n,t,a,a1,b1,c1,a2,b2,c2,{from:accounts[1],gas:3000000});
          isvalid=await contractInstance.castVote(encryptedmsg,encryptedmsghash,votevaluehash,nullifier,n,t,a,prooflist,valueprooflist,{from:accounts[1],gas:3000000});

          //isvalid=await contractInstance.castVote(publicSignals[6],publicSignals[1],publicSignals[0],proof.pi_a,proof.pi_b,proof.pi_c,{from:accounts[0],gas:3000000});
          var r_proofa0=await contractInstance.getProof.call(0);
          console.log("r_proofa0:"+r_proofa0);
          var r_encryptedmsg=await contractInstance.encryptedmsgs.call(0);
          var r_n=await contractInstance.getVoteTLPN.call(0);
          var r_a=await contractInstance.getVoteTLPA.call(0);
          var r_t=await contractInstance.getVoteTLPT.call(0);
          console.log("r_encryptedmsg:"+r_encryptedmsg);
          console.log("r_n:"+r_n);
          console.log("r_a:"+r_a);
          console.log("r_t:"+r_t);
          var r_m=await solveTLPuzzle(BigInt(r_encryptedmsg),BigInt(r_a),BigInt(r_t),BigInt(r_n));
          console.log("r_m:"+r_m);
          var reversedmsg=reverseMsg(r_m);
          console.log("r_m%2:"+reversedmsg);

          var result=await contractInstance.submitPuzzleSolution(0,0,{from:accounts[2],gas:3000000});
          var proposalcount=await contractInstance.getProposalCount.call(0);
          console.log("Count:"+proposalcount);
           // console.log("The received values to the smart contract:");
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);
           // inputlist=await contractInstance.nullifiers.call(0);
           // console.log("nullifiers:"+inputlist);


        } catch (e) {
          console.log(e);
        } finally {

        }



        await revertToSnapshot(snapshotId);

      });





    })
})
