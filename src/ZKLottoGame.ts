/**
 * This file defines the `LottoGame` smart contract and the helpers it needs.
 */

import {
  Field,
  State,
  PublicKey,
  SmartContract,
  Reducer,
  state,
  method,
  Bool,
  Provable,
  Signature,
  Struct,
  UInt64,
  MerkleTree,
  MerkleMap,
  Poseidon,
  Experimental,
  MerkleWitness,
} from 'o1js';

export { LottoNumbers, GameBoard, ZKLottoGame };

export class MerkleWitness8 extends MerkleWitness(8) {}


  // ==============================================================================

  class GameBoard extends Struct({
    gmWeek: Field,
    startTime: UInt64,
    endTime: UInt64,
    gameStatus: Bool,
  }) {
    static from(gmWeek: Field, startTime: UInt64, endTime: UInt64, gameStatus: Bool) {
      return new GameBoard({ gmWeek: gmWeek, startTime: startTime, endTime: endTime, gameStatus: gameStatus});
    }
  
  }

  function Optional<T>(type: Provable<T>) {
    return class Optional_ extends Struct({ isSome: Bool, value: type }) {
      constructor(isSome: boolean | Bool, value: T) {
        super({ isSome: Bool(isSome), value });
      }
  
      toFields() {
        return Optional_.toFields(this);
      }
    };
  }
  
  class OptionalBool extends Optional(GameBoard) {}



class LottoNumbers extends Struct({
  gmWeek: Field,
  value: Provable.Array(Field, 6),
}) {
  static from(gmWeek: Field, value: Field[]) {
    return new LottoNumbers({ gmWeek: gmWeek, value: value.map((row) => row) });
  }

  hash() {
    const numbersHash = Poseidon.hash(this.value.flat());
    return Poseidon.hash([this.gmWeek, numbersHash]);
  }
}


class ZKLottoGame extends SmartContract {
  // The board is serialized as a single field element
  @state(Field) lottoboard = State<GameBoard>();

  //lotto game states
  @state(Bool) lottoGameDone = State<Bool>();
  @state(Field) lottogameWeek = State<Field>();
  @state(Field) currentGameTimeStart = State<UInt64>();
  @state(Field) currentGameTimeEnd = State<UInt64>();
  @state(Field) gameduration = State<UInt64>();

  //Lotto Winning numbers Hash 
  @state(Field) LottoWinHash = State<Field>();
  @state(Field) storageTreeRoot = State<Field>();


  init() {
    this.network.globalSlotSinceGenesis.requireEquals(this.network.globalSlotSinceGenesis.get());
    super.init();
    this.lottoGameDone.set(Bool(true));
    this.lottogameWeek.set(Field(0));
    this.currentGameTimeStart.set(UInt64.from(0));
    this.currentGameTimeEnd.set(this.network.timestamp.get());
    this.gameduration.set(UInt64.from(518400)); //game duration is 6 days, winning lotto numbers generated on day 7
    const emptyTreeRoot = new MerkleTree(8).getRoot();
    this.storageTreeRoot.set(emptyTreeRoot);
  }

  @method async startLottoWeek() {
    this.network.globalSlotSinceGenesis.requireEquals(this.network.globalSlotSinceGenesis.get());
    //start lotto game week by increasing by 1 week
    //ensure current game week is at least 1 week past previous game week
    // const currentGameTimeStart = this.currentGameTimeStart.get();
    this.currentGameTimeStart.requireEquals(this.currentGameTimeStart.get());
    // this.network.timestamp.get().assertGreaterThan(currentGameTimeStart.add(86400));
    this.currentGameTimeStart.set(this.network.timestamp.get())
    //game ends 6 days after new game start. //could round-up timestamp to the hour
    const newGameEndTime = this.currentGameTimeStart.get().add(this.gameduration.get());
    this.currentGameTimeEnd.requireEquals(this.currentGameTimeEnd.get());
    this.gameduration.requireEquals(this.gameduration.get());
    this.currentGameTimeEnd.set(newGameEndTime);

    // // you can only start a new game if the current game is done
    this.lottoGameDone.requireEquals(Bool(true));
    this.lottoGameDone.set(Bool(false));
    
    //set new game week
    let gameWeek = this.lottogameWeek.get();
    this.lottogameWeek.requireEquals(gameWeek);
    gameWeek = gameWeek.add(Field(1));
    this.lottogameWeek.set(gameWeek);

  }

  @method async endLottoWeek(winningNums: LottoNumbers) {
    //start lotto game week by increasing by 1 week
    //ensure current game week is at least 1 week past previous game week
    const currentGameTimeEnd = this.currentGameTimeEnd.get();
    this.currentGameTimeEnd.requireEquals(this.currentGameTimeEnd.get());
    // this.network.timestamp.get().assertGreaterThanOrEqual(currentGameTimeEnd);

    //end GameWeek
    this.lottoGameDone.requireEquals(Bool(false));
    this.lottoGameDone.set(Bool(true));

    /*generate lotto winning numbers
    random six numbers and set as Field array
    Ideally, we are to a more secure verifiable means to generate the winning numbers
    possibly using VRF. But for this PoC, we manually set the winning numbers
    */
    
    // verify the lotto week to end is same as current week
    this.lottogameWeek.requireEquals(winningNums.gmWeek);

     
    //@notice MerkleMap might be a better option?
    //hash week winning numbers and set to LottoWinHash
    this.LottoWinHash.requireEquals(this.LottoWinHash.get());
    const winningHash = winningNums.hash();
    this.LottoWinHash.set(winningHash);

  }

  // Lotto Game:
  //  ----   ----    ----   ----     ----   ----
  // | X  | | X  |  | X  | | X  |   | X  | | X  |
  //  ----   ----    ----   ----     ----   ----

  @method async play(
    pubkey: PublicKey,
    signature: Signature,
    week_: Field,
    lottoEntryHash: Field,
  ) {
    //require game week is active
    this.lottogameWeek.requireEquals(week_);
    this.lottoGameDone.requireEquals(Bool(false));

    
    //verify lotto entry is signed by user
    // const lottoEntryHash = lottoEntry.hash();
    signature.verify(pubkey, [week_, lottoEntryHash]).assertTrue();

 // retrieve the current Merkle root
    const currentRoot = this.storageTreeRoot.get();
    this.storageTreeRoot.requireEquals(currentRoot);

    // generate a new Merkle leaf for this entry
    const leaf = lottoEntryHash;

    // create a Merkle Tree and update it with the new leaf
    let tree = new MerkleTree(8);
    tree.setLeaf(week_.toBigInt() % BigInt(256), leaf); 

    // compute the new root and update the state
    const newRoot = tree.getRoot();
    this.storageTreeRoot.set(newRoot);
  }

  @method.returns(Bool) async ClaimWinning(
    pubkey: PublicKey,
    signature: Signature,
    week_: Field,
    winningNums: LottoNumbers,
    witness: MerkleWitness8,
  ) {
    const currentRoot = this.storageTreeRoot.get();
    this.storageTreeRoot.requireEquals(currentRoot);

    const leaf = winningNums.hash();
    const isValid = witness.calculateRoot(leaf).equals(currentRoot);
    isValid.assertTrue("Invalid proof");

    signature.verify(pubkey, [week_, leaf]).assertTrue();

    return Bool(true);
  }
}
