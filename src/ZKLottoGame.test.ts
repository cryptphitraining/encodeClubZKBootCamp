import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { offchainState, LottoNumbers, GameBoard, ZKLottoGame } from './ZKLottoGame';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('ZKLottoGame', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: ZKLottoGame;

  beforeAll(async () => {
    if (proofsEnabled) await ZKLottoGame.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new ZKLottoGame(zkAppAddress);
    offchainState.setContractInstance(zkApp);

    // compile Offchain state program
    if (proofsEnabled) {
      console.time('compile program');
      await offchainState.compile();
      console.timeEnd('compile program');
      console.time('compile contract');
      await ZKLottoGame.compile();
      console.timeEnd('compile contract');
    }
    
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  // let initialCommitment: Field = Field(0);
  // async function makeGuess(name: Names, index: bigint, guess: number) {
  //   let account = Accounts.get(name)!;
  //   let w = Tree.getWitness(index);
  //   let witness = new MyMerkleWitness(w);

  //   let tx = await Mina.transaction(feePayer, async () => {
  //     await contract.guessPreimage(Field(guess), account, witness);
  //   });
  //   await tx.prove();
  //   await tx.sign([feePayer.key, contractAccount.key]).send();

  //   // if the transaction was successful, we can update our off-chain storage as well
  //   account.points = account.points.add(1);
  //   Tree.setLeaf(index, account.hash());
  //   contract.commitment.get().assertEquals(Tree.getRoot());
  // }

  it('generates and deploys the `ZKLottoGame` smart contract', async () => {
    await localDeploy();

    const num = await zkApp.settleWeek();
    expect(num).toEqual(Field(0));
  });

  // it('correctly start Lotto Week on the `ZKLottoGame` smart contract', async () => {
  //   await localDeploy();
  //   console.time('settlement proof 1');
  //   let proof = await offchainState.createSettlementProof();
  //   console.timeEnd('settlement proof 1');

  //   console.time('settle 1');
  //   await Mina.transaction(sender, () => contract.settle(proof))
  //     .sign([sender.key])
  //     .prove()
  //     .send();
  //   console.timeEnd('settle 1');
    

  //   // update transaction
  //   const txn = await Mina.transaction(senderAccount, async () => {
  //     await zkApp.startLottoWeek();
  //   });
  //   await txn.prove();
  //   await txn.sign([senderKey]).send();

  //   const GameWeekNum = zkApp.lottogameWeek.get();
  //   expect(GameWeekNum).toEqual(Field(1));
  // });

  // it('Should fail the start of a new game week when one is running on the `ZKLottoGame` smart contract', async () => {
  //   await localDeploy();

  //   // Start new Lotto Game Week
  //   const txn1 = await Mina.transaction(senderAccount, async () => {
  //     await zkApp.startLottoWeek();
  //   });
  //   await txn1.prove();
  //   await txn1.sign([senderKey]).send();

  //   //start Lotto Game Week again
  //   try {
  //     const txn2 = await Mina.transaction(senderAccount, async () => {
  //       await zkApp.startLottoWeek();
  //     });
  //     await txn2.prove();
  //     await txn2.sign([senderKey]).send();
  //   }catch(e){
  //     console.log(e)
  //   }
    
  //   const GameWeekNum = zkApp.lottogameWeek.get();
  //   expect(GameWeekNum).toEqual(Field(1));
  // });
});
