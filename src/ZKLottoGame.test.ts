import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { Lotto, ZKLottoGame } from './ZKLottoGame';

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
    expect(num).toEqual(Field(1));
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
    expect(updatedNum).toEqual(Field(2));
  });
});
