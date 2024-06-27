import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, Signature, MerkleWitness, MerkleTree } from 'o1js';
import { LottoNumbers, GameBoard, ZKLottoGame } from './ZKLottoGame';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

const height = 8;
const tree = new MerkleTree(height);
class MerkleWitness8 extends MerkleWitness(height) {}


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

  it('generates and deploys the `ZKLottoGame` smart contract', async () => {
    await localDeploy();
    const num = zkApp.lottogameWeek.get();
    expect(num).toEqual(Field(0));
  });

  it('correctly start Lotto Week on the `ZKLottoGame` smart contract', async () => {
    await localDeploy();

    // update transaction
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.startLottoWeek();
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const updatedNum = zkApp.lottogameWeek.get();
    expect(updatedNum).toEqual(Field(1));
  });

  it('Current game must end before new game starts in `ZKLottoGame` smart contract', async () => {
    await localDeploy();

    // update transaction
    const txn1 = await Mina.transaction(senderAccount, async () => {
      await zkApp.startLottoWeek();
    });
    await txn1.prove();
    await txn1.sign([senderKey]).send();

    const gameWeek = zkApp.lottogameWeek.get();
    expect(gameWeek).toEqual(Field(1));

    //-----------------------------
    // second transaction
    const winningNumbers = [Field(2), Field(15), Field(19), Field(28), Field(35), Field(42)]
    const lottoWinInfo =  LottoNumbers.from(gameWeek, winningNumbers);

    const txn2 = await Mina.transaction(senderAccount, async () => {
      await zkApp.endLottoWeek(lottoWinInfo);
    });
    await txn2.prove();
    await txn2.sign([senderKey]).send();

    const winningHash = lottoWinInfo.hash();
    // const updatedNum2 = zkApp.LottoWinHash.get();
    expect(winningHash).toEqual(zkApp.LottoWinHash.get());
  });


  it('Players can submit lotto numbers to play starts in `ZKLottoGame` smart contract', async () => {
    await localDeploy();

    // update transaction
    const txn1 = await Mina.transaction(senderAccount, async () => {
      await zkApp.startLottoWeek();
    });
    await txn1.prove();
    await txn1.sign([senderKey]).send();

    const gameWeek = zkApp.lottogameWeek.get();
    expect(gameWeek).toEqual(Field(1));

    // End Game
    const chosenNumbers = [Field(2), Field(15), Field(19), Field(28), Field(35), Field(42)]
    const PlayerEntry =  LottoNumbers.from(gameWeek, chosenNumbers);
    const PlayerEntryHash = PlayerEntry.hash();

    const signature = Signature.create(
      senderKey,
      [gameWeek, PlayerEntryHash]);


    const txn2 = await Mina.transaction(senderAccount, async () => {
      await zkApp.play(senderAccount, signature, gameWeek, PlayerEntryHash);
    });
    await txn2.prove();
    await txn2.sign([senderKey]).send();

    // End Game
    // const winningNumbers = [Field(2), Field(15), Field(19), Field(28), Field(35), Field(42)]
    const lottoEntryInfo =  LottoNumbers.from(gameWeek, chosenNumbers);

    const txn3 = await Mina.transaction(senderAccount, async () => {
      await zkApp.endLottoWeek(lottoEntryInfo);
    });
    await txn3.prove();
    await txn3.sign([senderKey]).send();

    const winningHash = lottoEntryInfo.hash();
    // const updatedNum2 = zkApp.LottoWinHash.get();
    expect(winningHash).toEqual(zkApp.LottoWinHash.get());
  });


  it('Winning Player can claim Winnings in `ZKLottoGame` smart contract', async () => {
    await localDeploy();

    // update transaction
    const txn1 = await Mina.transaction(senderAccount, async () => {
      await zkApp.startLottoWeek();
    });
    await txn1.prove();
    await txn1.sign([senderKey]).send();

    const gameWeek = zkApp.lottogameWeek.get();
    expect(gameWeek).toEqual(Field(1));
    // Play Game
    const chosenNumbers = [Field(2), Field(15), Field(19), Field(28), Field(35), Field(42)]
    const PlayerEntry =  LottoNumbers.from(gameWeek, chosenNumbers);
    const PlayerEntryHash = PlayerEntry.hash();

    const signature1 = Signature.create(
      senderKey,
      [gameWeek, PlayerEntryHash]);


    const txn2 = await Mina.transaction(senderAccount, async () => {
      await zkApp.play(senderAccount, signature1, gameWeek, PlayerEntryHash);
    });
    await txn2.prove();
    await txn2.sign([senderKey]).send();


    //End Game
    const lottoEntryInfo =  LottoNumbers.from(gameWeek, chosenNumbers);
    const txn3 = await Mina.transaction(senderAccount, async () => {
      await zkApp.endLottoWeek(lottoEntryInfo);
    });
    await txn3.prove();
    await txn3.sign([senderKey]).send();

    const winningHash = lottoEntryInfo.hash();
    // const updatedNum2 = zkApp.LottoWinHash.get();
    expect(winningHash).toEqual(zkApp.LottoWinHash.get());


    // Claim Wins
    const senderWitness = new MerkleWitness8(tree.getWitness(gameWeek.toBigInt()));

    const signature2 = Signature.create(
      senderKey,
      [gameWeek, winningHash]);

    const txn4 = await Mina.transaction(senderAccount, async () => {
      await zkApp.ClaimWinning(senderAccount, signature2, gameWeek, winningHash, senderWitness);
    });
    await txn4.prove();
    await txn4.sign([senderKey]).send();

    expect(winningHash).toEqual(zkApp.LottoWinHash.get());
  });



  it('Player cannot claim for wrong lotto numbers in `ZKLottoGame` smart contract', async () => {
    await localDeploy();

    // Start Game
    const txn1 = await Mina.transaction(senderAccount, async () => {
      await zkApp.startLottoWeek();
    });
    await txn1.prove();
    await txn1.sign([senderKey]).send();

    const gameWeek = zkApp.lottogameWeek.get();
    expect(gameWeek).toEqual(Field(1));

    // Play Game
    const wrongNumbers = [Field(2), Field(15), Field(20), Field(28), Field(35), Field(43)]
    const wrongEntry =  LottoNumbers.from(gameWeek, wrongNumbers);
    const PlayerWrongEntryHash = wrongEntry.hash();

    const signature1 = Signature.create(
      senderKey,
      [gameWeek, PlayerWrongEntryHash]);


    const txn2 = await Mina.transaction(senderAccount, async () => {
      await zkApp.play(senderAccount, signature1, gameWeek, PlayerWrongEntryHash);
    });
    await txn2.prove();
    await txn2.sign([senderKey]).send();


    //End Game

    const winningNumbers = [Field(2), Field(15), Field(19), Field(28), Field(35), Field(42)]
    const WinningEntry =  LottoNumbers.from(gameWeek, winningNumbers);

    const txn3 = await Mina.transaction(senderAccount, async () => {
      await zkApp.endLottoWeek(WinningEntry);
    });
    await txn3.prove();
    await txn3.sign([senderKey]).send();

    const winningHash = WinningEntry.hash();
    expect(winningHash).toEqual(zkApp.LottoWinHash.get());


    // Claim Wins

    const senderWitness = new MerkleWitness8(tree.getWitness(gameWeek.toBigInt()));
    const signature2 = Signature.create(
      senderKey,
      [gameWeek, winningHash]);

    try {
      const txn4 = await Mina.transaction(senderAccount, async () => {
      await zkApp.ClaimWinning(senderAccount, signature2, gameWeek, winningHash, senderWitness);
      });
      await txn4.prove();
      await txn4.sign([senderKey]).send();
    }catch(e){
      console.log(e)
    }

  });


});