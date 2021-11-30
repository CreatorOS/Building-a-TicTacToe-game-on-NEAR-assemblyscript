import {createGame} from "../assembly"
describe("createGame", ()=>{
    it("should create a game", () => {
        const gameId = createGame();
        expect(gameId).toBeTruthy();
      })    
})