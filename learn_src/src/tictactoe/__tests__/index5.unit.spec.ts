import { createGame, joinGame, play, claimReward } from "../assembly";
import { VMContext } from "near-sdk-as";

describe("claimReward", () => {
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