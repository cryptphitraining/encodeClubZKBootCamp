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

const { OffchainState, OffchainStateCommitments } = Experimental;

export { offchainState, LottoNumbers, GameBoard, ZKLottoGame };


export class MerkleWitness4 extends MerkleWitness(4) {}
export class MerkleWitness8 extends MerkleWitness(8) {}
export class MerkleWitness16 extends MerkleWitness(16) {}
export class MerkleWitness24 extends MerkleWitness(24) {}
export class MerkleWitness32 extends MerkleWitness(32) {}
export class MerkleWitness64 extends MerkleWitness(64) {}
export class MerkleWitness128 extends MerkleWitness(128) {}
export class MerkleWitness256 extends MerkleWitness(256) {}




  
  // ==============================================================================

  // export type Update = {
  //   leaf: Field[];
  //   leafIsEmpty: Bool;
  //   newLeaf: Field[];
  //   newLeafIsEmpty: Bool;
  //   leafWitness: MerkleWitness8;
  // };
  
  // export const assertRootUpdateValid = (
  //   serverPublicKey: PublicKey,
  //   rootNumber: Field,
  //   root: Field,
  //   updates: Update[],
  //   storedNewRootNumber: Field,
  //   storedNewRootSignature: Signature
  // ) => {
  //   let emptyLeaf = Field(0);
  
  //   var currentRoot = root;
  //   for (var i = 0; i < updates.length; i++) {
  //     const { leaf, leafIsEmpty, newLeaf, newLeafIsEmpty, leafWitness } =
  //       updates[i];
  
  //     // check the root is starting from the correct state
  //     let leafHash = Provable.if(leafIsEmpty, emptyLeaf, Poseidon.hash(leaf));
  //     leafWitness.calculateRoot(leafHash).assertEquals(currentRoot);
  
  //     // calculate the new root after setting the leaf
  //     let newLeafHash = Provable.if(
  //       newLeafIsEmpty,
  //       emptyLeaf,
  //       Poseidon.hash(newLeaf)
  //     );
  //     currentRoot = leafWitness.calculateRoot(newLeafHash);
  //   }
  
  //   const storedNewRoot = currentRoot;
  
  //   // check the server is storing the stored new root
  //   storedNewRootSignature
  //     .verify(serverPublicKey, [storedNewRoot, storedNewRootNumber])
  //     .assertTrue();
  //   rootNumber.assertLessThan(storedNewRootNumber);
  
  //   return storedNewRoot;
  // };


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

  // function Optional<T>(type: Provable<T>) {
  //   return class Optional_ extends Struct({ isSome: Bool, value: type }) {
  //     constructor(isSome: boolean | Bool, value: T) {
  //       super({ isSome: Bool(isSome), value });
  //     }
  
  //     toFields() {
  //       return Optional_.toFields(this);
  //     }
  //   };
  // }
  
  // class OptionalBool extends Optional(GameBoard) {}



// class for creating the new Lotto Game Board
// class Lotto {
//   lottogame: OptionalBool[];
  

//   constructor() {
//     let lottogame = [];
    
//     const gmWeek = Field(0);
//     const startTime = new UInt64(0);
//     const endTime = new UInt64(0);
//     const gameStatus = Bool(false);
    

//     const gameBoard =  GameBoard.from(gmWeek, startTime, endTime, gameStatus);
//     const GameOption = (new OptionalBool(gameStatus, gameBoard));

//     lottogame.push(GameOption);
//     this.lottogame = lottogame;
//     }
 

//   startNewLotto(
//     gmWeek: Field,
//     startTime: UInt64,
//     endTime: UInt64,
//     gameStatus: Bool,
//   ) {
//     const gameBoard =  GameBoard.from(gmWeek, startTime, endTime, gameStatus);
//     for (let i = 1; i < 4; i++) {
//       const toUpdate = gmWeek.equals(new Field(i));

//       toUpdate.and(this.lottogame[i].isSome).assertEquals(false);

//       // copy the game board (or update if new game is to start)
//       this.lottogame[i] = Provable.if(
//         toUpdate,
//         new OptionalBool(true, gameBoard),
//         this.lottogame[i]
//       );
//     }

    
//   }

  
// }

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
class LottoGameMerkleWitness extends MerkleWitness(8) {}

/* =====================================================
            OFFCHAIN STATE
   =====================================================
*/

// //lotto game states
// @state(Bool) lottoGameDone = State<Bool>();
// @state(Field) lottogameWeek = State<Field>();
// @state(Field) currentGameStartTime = State<UInt64>();
// @state(Field) currentGameEndTime = State<UInt64>();
// @state(Field) gameduration = State<UInt64>();

// //Lotto Winning numbers Details
// @state(Field) LottoWeekWinningNumbers = State<LottoNumbers>();
// @state(Field) LottoWinHistory = State<LottoNumbers[]>();
// @state(Field) LottoWinHash = State<Field>();

const offchainState = OffchainState({
  lottoGameDone: OffchainState.Field(Bool),
  lottogameWeek: OffchainState.Field(Field),
  currentGameStartTime: OffchainState.Field(UInt64),
  currentGameEndTime: OffchainState.Field(UInt64),
  gameduration: OffchainState.Field(UInt64),
  LottoWeekWinningNumbers: OffchainState.Field(LottoNumbers),
  LottoWinHistory: OffchainState.Map(Field, LottoNumbers),
  LottoWinHash: OffchainState.Field(LottoNumbers),
});

class StateProof extends offchainState.Proof {}

// class LottoWinningHistory extends Struct({
//   value: Provable.Array(Provable.Array(Field, 52), 6),
// }) {
//   static from(value: Field[][]) {
//     return new LottoWinningHistory({ value: value.map((row) => row.map(Field)) });
//   }
// }



class ZKLottoGame extends SmartContract {
  //offchainState
  @state(OffchainStateCommitments) offchainState = State(
    OffchainStateCommitments.empty()
  );
  // The board is serialized as a single field element
  @state(Field) lottoboard = State<GameBoard>();

  

  //Game Commit Witness
  @state(Field) GameStorageTreeRoot = State<Field>();
  @state(Field) PlayersStorageTreeRoot = State<Field>();

  //Lotto Play Entries
  @state(Field) LastLottoEntryHash = State<Field>();

  


  init() {
    super.init();
    offchainState.fields.lottoGameDone.update({
      from: undefined,
      to: true,
    });
    offchainState.fields.lottogameWeek.update({
      from: undefined,
      to: Field(0),
    });
    offchainState.fields.currentGameStartTime.update({
      from: undefined,
      to: UInt64.from(0),
    });
    offchainState.fields.currentGameEndTime.update({
      from: undefined,
      to: this.network.timestamp.get(),
    });
    offchainState.fields.gameduration.update({
      from: undefined,
      to: UInt64.from(518400), //game duration is 6 days, winning lotto numbers generated on day 7
    });

    // this.lottoGameDone.set(Bool(true));
    // this.lottogameWeek.set(Field(0));
    // this.currentGameStartTime.set(UInt64.from(0));
    // this.currentGameEndTime.set(this.network.timestamp.get());
    // this.gameduration.set(UInt64.from(518400)); //game duration is 6 days, winning lotto numbers generated on day 7
    //initiate gameRoot
    const emptyTreeRoot = Field(0);
    this.GameStorageTreeRoot.set(emptyTreeRoot);
    this.PlayersStorageTreeRoot.set(emptyTreeRoot);
  }

  @method.returns(Field)
  async settleWeek() {
    let currentWeek = await offchainState.fields.lottogameWeek.get();
    return (currentWeek).orElse(0n);
  }  

  // @method async startLottoWeek() {
  //   //start lotto game week by increasing by 1 week
  //   //ensure current game week is at least 1 week past previous game week
  //   const currentGameStartTime = this.currentGameStartTime.get();
  //   this.network.timestamp.get().assertGreaterThan(currentGameStartTime.add(86400));
  //   this.currentGameStartTime.set(this.network.timestamp.get())
  //   //game ends 6 days after new game start. //could round-up timestamp to the hour
  //   const newGameEndTime = this.currentGameStartTime.get().add(this.gameduration.get());
  //   this.currentGameEndTime.set(newGameEndTime);

  //   // you can only start a new game if the current game is done
  //   this.lottoGameDone.requireEquals(Bool(true));
  //   this.lottoGameDone.set(Bool(false));
    
  //   //set new game week
  //   let gameWeek = this.lottogameWeek.get();
  //   this.lottogameWeek.requireEquals(gameWeek);
  //   gameWeek = gameWeek.add(Field(1));
  //   this.lottogameWeek.set(gameWeek);

    
    

  //   /*Create New Lotto Week, start the new lotto for the week
  //   This section to start the timer for the new Lotto Game week, should display the Week No. and Countdown
  //   */
  //   this.lottoboard.requireEquals(this.lottoboard.get());
  //   //this is for the demo. Production would require creating a new board each game week
  //   const gameBoard =  GameBoard.from(
  //     gameWeek,
  //     this.currentGameStartTime.get(),
  //     this.currentGameEndTime.get(),
  //     this.lottoGameDone.get()
  //   );
  //   this.lottoboard.set(gameBoard);

  //   /*let lottoboard = new Lotto(this.lottoboard.get());
  //   lottoboard.startNewLotto(
  //     gameWeek,
  //     this.currentGameStartTime,
  //     this.currentGameEndTime, this.lottoGameDone) (gameWeek, Bool(true));
  //     this.lottoboard.set(lottoboard.serialize());
  //   */
    
  // }

  // @method async endLottoWeek(winningNums: LottoNumbers, leafWitness: LottoGameMerkleWitness) {
  //   //start lotto game week by increasing by 1 week
  //   //ensure current game week is at least 1 week past previous game week
  //   const currentGameEndTime = this.currentGameEndTime.get();
  //   this.network.timestamp.get().assertGreaterThanOrEqual(currentGameEndTime);

  //   //end GameWeek
  //   this.lottoGameDone.requireEquals(Bool(false));
  //   this.lottoGameDone.set(Bool(true));

  //   /*generate lotto winning numbers
  //   random six numbers and set as Field array
  //   Ideally, we are to a more secure verifiable means to generate the winning numbers
  //   possibly using VRF. But for this PoC, we manually set the winning numbers
  //   */
    
  //   // verify the lotto week to end is same as current week
  //   this.lottogameWeek.requireEquals(winningNums.gmWeek);
  //   //set winning details
  //   this.LottoWeekWinningNumbers.set(winningNums);
    
  //   //add to winning game lotto numbers array
  //   const winHistory = this.LottoWinHistory.get();
  //   winHistory.push(winningNums);
    
    
  //   // this.LottoWeekWinningNumbers.set(winningHash);
    
  //   //@notice MerkleMap might be a better option?
    
  //   const currentWinningHash = this.LottoWinHash.get();
  //   //hash week winning numbers and set to LottoWinHash
  //   this.LottoWinHash.requireEquals(currentWinningHash);
  //   const NewWinningHash = winningNums.hash();
  //   this.LottoWinHash.set(NewWinningHash);

  //   // we fetch the on-chain commitment
  //   let gameRoot = this.GameStorageTreeRoot.get();
  //   this.GameStorageTreeRoot.requireEquals(gameRoot);

  //   // we check that the winning numbers for the week is within the committed Merkle Tree
  //   leafWitness.calculateRoot(currentWinningHash).assertEquals(gameRoot);

  //   // we calculate the new Merkle Root, based on new lotto winning numbers
  //   let newGameRoot = leafWitness.calculateRoot(NewWinningHash);
  //   this.GameStorageTreeRoot.set(newGameRoot);
    

  // }

  // // Lotto Game:
  // //  ----   ----    ----   ----     ----   ----
  // // | X  | | X  |  | X  | | X  |   | X  | | X  |
  // //  ----   ----    ----   ----     ----   ----

  // @method async play(
  //   pubkey: PublicKey,
  //   signature: Signature,
  //   week_: Field,
  //   lottoEntry: LottoNumbers,
  //   leafWitness: LottoGameMerkleWitness,
  // ) {
  //   //require game week is active
  //   this.lottogameWeek.requireEquals(week_);
  //   this.lottoGameDone.requireEquals(Bool(false));

    
  //   //verify lotto entry is signed by user
  //   const newLottoEntryHash = lottoEntry.hash();
  //   const newLeaf = pubkey.toGroup().toFields().concat(newLottoEntryHash.toFields());
  //   signature.verify(pubkey, newLeaf).assertTrue();

  //   /*TO-DO
  //   add user's lotto numbers entry to merkleTree for the Game week
  //   */
  //   const currentLottoEntryHash = this.LastLottoEntryHash.get();
  //   this.LastLottoEntryHash.requireEquals(currentLottoEntryHash);
    

  //   // we fetch the on-chain root for players lotto entry
  //   let CurrentPlayerEntryRoot = this.PlayersStorageTreeRoot.get();
  //   this.PlayersStorageTreeRoot.requireEquals(CurrentPlayerEntryRoot);

  //   // we check that the winning numbers for the week is within the committed Merkle Tree
  //   leafWitness.calculateRoot(currentLottoEntryHash).assertEquals(CurrentPlayerEntryRoot);

  //   // we calculate the new Player Lotto Entries Merkle Root when a player submits an entry
  //   let newGameRoot = leafWitness.calculateRoot(newLottoEntryHash);
  //   this.PlayersStorageTreeRoot.set(newGameRoot);


  //   //update last lotto entry hash with the new entry hash
  //   this.LastLottoEntryHash.set(newLottoEntryHash);

  // }


  // @method async ClaimWinning(
  //   pubkey: PublicKey,
  //   signature: Signature,
  //   leafWitness: MerkleWitness8,
  //   week_: Field,
  //   winningNums: LottoNumbers,
  // ) {
  //   //verify claim request is signed by caller
  //   const WinningHash = winningNums.hash();
  //   const newLeaf = pubkey.toGroup().toFields().concat(WinningHash.toFields());
  //   signature.verify(pubkey, newLeaf).assertTrue();


  //   //verify the user's entry is in the Player Players Storage Tree
  //   try{

  //   }catch(e){
  //     console.log(e);
  //   }


  //   //transfer winnings to user after successful proof verification
   
  // }

  @method
  async settle(proof: StateProof) {
    await offchainState.settle(proof);
  }

  
}
