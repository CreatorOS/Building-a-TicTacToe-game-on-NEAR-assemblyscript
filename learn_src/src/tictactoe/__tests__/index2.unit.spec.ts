import { createGame, joinGame } from "../assembly";
import { VMContext } from "near-sdk-as";
describe("joinGame", () => {
  it("should allow users to join", () => {
    VMContext.setSigner_account_id("Bob.testnet");
    const gameId = createGame();
    VMContext.setSigner_account_id("Alice.testnet");
    const res = joinGame(gameId);
    expect(res).toBe("Joined!");
  })
})