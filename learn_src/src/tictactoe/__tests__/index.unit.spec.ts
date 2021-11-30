import { createGame, joinGame, play, isGameOver, claimReward } from "../assembly";
import { VMContext, u128 } from "near-sdk-as";

describe("TicTacToe tests", () => {
  it("should create a game", () => {
    const gameId = createGame();
    expect(gameId).toBeTruthy();
  })

  it("should allow users to join", () => {
    const gameId = createGame();
    VMContext.setSigner_account_id("Alice.testnet");
    const res = joinGame(gameId);
    expect(res).toBe("Joined!");
  })

  it("should allow users to play", () => {
    VMContext.setSigner_account_id("Bob.testnet");
    const gameId = createGame();
    VMContext.setSigner_account_id("Alice.testnet");
    joinGame(gameId);
    VMContext.setSigner_account_id("Bob.testnet");
    const played = play(gameId, 0, 0);
    expect(played).toBeTruthy();
  })

  it("should know when the game is over", () => {
    VMContext.setSigner_account_id("Bob.testnet");
    const gameId = createGame();
    VMContext.setSigner_account_id("Alice.testnet");
    joinGame(gameId);
    VMContext.setSigner_account_id("Bob.testnet");
    play(gameId, 0, 0);
    VMContext.setSigner_account_id("Alice.testnet");
    play(gameId, 0, 1);
    VMContext.setSigner_account_id("Bob.testnet");
    play(gameId, 1, 1);
    VMContext.setSigner_account_id("Alice.testnet");
    play(gameId, 1, 0);
    VMContext.setSigner_account_id("Bob.testnet");
    play(gameId, 2, 2);
    const over = isGameOver(gameId);
    expect(over).toBeTruthy();
  })

  it("should reward the winner", () => {
    VMContext.setSigner_account_id("Bob.testnet");
    const gameId = createGame();
    VMContext.setSigner_account_id("Alice.testnet");
    joinGame(gameId);
    VMContext.setSigner_account_id("Bob.testnet");
    play(gameId, 0, 0);
    VMContext.setSigner_account_id("Alice.testnet");
    play(gameId, 0, 1);
    VMContext.setSigner_account_id("Bob.testnet");
    play(gameId, 1, 1);
    VMContext.setSigner_account_id("Alice.testnet");
    play(gameId, 1, 0);
    VMContext.setSigner_account_id("Bob.testnet");
    play(gameId, 2, 2);
    const rewarded = claimReward(gameId);
    expect(rewarded).toBeTruthy();
  })
})