import { createGame, joinGame, play } from "../assembly";
import { VMContext } from "near-sdk-as";

describe("play", () => {
    it("should allow users to play", () => {
        VMContext.setSigner_account_id("Bob.testnet");
        const gameId = createGame();
        VMContext.setSigner_account_id("Alice.testnet");
        joinGame(gameId);
        VMContext.setSigner_account_id("Bob.testnet");
        const played = play(gameId, 0, 0);
        expect(played).toBeTruthy();
    })
})