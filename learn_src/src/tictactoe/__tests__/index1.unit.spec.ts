import {createGame} from "../assembly";
import {VMContext} from "near-sdk-as";

describe("createGame", ()=>{
    it("should create a game", () => {
        VMContext.setSigner_account_id("Bob.testnet");
        const gameId = createGame();
        expect(gameId).toBeTruthy();
      })    
})