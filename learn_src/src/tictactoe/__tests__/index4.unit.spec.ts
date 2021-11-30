import { createGame, joinGame, play, isGameOver } from "../assembly";
import { VMContext } from "near-sdk-as";
describe("isGameOver", () => {
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
})