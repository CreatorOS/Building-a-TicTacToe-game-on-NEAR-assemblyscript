import { PersistentMap, u128, RNG, context } from "near-sdk-core";

export enum GameState {
    Created,
    InProgress,
    Completed
}

@nearBindgen
export class Game {
    gameId: u32;
    gameState: GameState;
    player1: string;
    player2: string;
    winner: string;
    amount1: u128;
    amount2: u128;
    nextPlayer: string;
    board: Array<Row>;

    constructor() {
        const rng = new RNG<u32>(1, u32.MAX_VALUE);
        const roll = rng.next();
        this.gameId = roll;
        this.gameState = GameState.Created;
        this.player1 = context.sender;
        this.player2 = "";
        this.winner = "";
        this.amount1 = context.attachedDeposit;
        this.amount2 = u128.Zero;
        this.nextPlayer = this.player1;
        this.board = new Array<Row>(3);
        for (let i = 0; i < 3; i++) {
            this.board[i] = new Row(0);
        }
    }
}

@nearBindgen
export class Row {
    data: Array<u8>;

    constructor(default_value: u8) {
        this.data = new Array<u8>(3);
        for (let i = 0; i < 3; i++) {
            this.data[i] = default_value;
        }
    }
}

export const games = new PersistentMap<u32, Game>("g");