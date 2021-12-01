# Building a TicTacToe game on NEAR    
A smart contract is a perfect tool for implementing games. It allows you to code your own rules and invite people to play. In addition, blockchains have the identity principle built-in (account IDs in NEAR). This allows you to define what players can and cannot do. 
In this quest, you will learn how to create a TicTacToe game on the NEAR blockchain using AssemblyScript. Let's get to it! 

## What does this contract do?
This contract will allow:
- Users to create TicTacToe games.
- Other users to join already-created games.
- players to compete in normal 3X3 TicTacToe games.
- Winners to claim their rewards.
Should be fun, right? Well, it will be. Let's do it!

## Writing our data models - GameState enumeration
Before writing our contract's functionality, we have to specify what data this contract will hold (a.k.a its state). First of all, we need to keep a record of each game's status. Is it still in progress? Is it over yet so the winner can claim the reward? An enumeration should be great for this. Look at the code snippet below from models.ts. You can also see some imports from NEAR's AssemblyScript's SDK to be used later on.
```ts
import { PersistentMap, u128, RNG, context } from "near-sdk-core";

export enum GameState {
    Created,
    InProgress,
    Completed
}
```
But you are here to try things yourself, yeah? Fair enough my geek friend, we will get there!

## Writing our data models - more important models
Let's continue and create utilities that will certainly come in handy. TicTacToe is played on a board, so we need to represent this board somehow. We are going to do this in an elegant-but-possibly-weird way, this is just to get you acquainted with the syntax. How about we divide the board into three rows, where each row is an array of size three? 
Two things for you to do here:

STEP 1 : Pass the array size between the parentheses, how many columns are on a TicTacToe board? Just add a single number.

STEP 2 : Inside the for loop, initialize each array member with the default value.

```ts
@nearBindgen
export class Row {
    data: Array<u8>;

    constructor(default_value: u8) {
        this.data = new Array<u8>(/*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/);
        for (let i = 0; i < 3; i++) {
            this.data[i] = /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/;
        }
    }
}
```
We also need a mapping that will store the game. Like, a mapping from game IDs to instances of class Game? But wait, we didn't create any of that! We will in the next subquest, but add this to our models for now.
```ts
export const games = new PersistentMap<u32, Game>("g");
```

## Writing our data models - the Game state fields
Well, we need a class to represent a game. Let's go through its fields:

- A 32-bit unsigned integer to store the identifier for a game, remember that ```games``` mapping in the previous subquest?

- A ```GameState``` to store in which phase our game is.

- A string to store the first player's NEAR account ID.

- A string to store the second player's NEAR account ID.

- A string to store the winner's NEAR account ID.

- A 128-bit unsigned integer to store how many NEARs the first player is willing to bid.

- A 128-bit unsigned integer to store how many NEARs the second player is willing to bid.

- A string to store the NEAR account ID of the player playing next.

- An array of ```Row```s to store the board.

```ts
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
}
```
The code snippet above is missing something. What is it? Yes, a constructor.

## Writing our data models - writing the Game's constructor
Take your time on this one. Pretty standard stuff I know, but utterly important. A constructor is invoked when a user creates a game. This user will be player one, so when we need to store their account ID. Also, the creator should be able to bid an amount of NEARs, let's store this one as well.

STEP 1 : Initialize the player1 field with the sender's account ID.

STEP 2 : initialize the amount 1 field with the amount of NEAR's sent 
along with the call.

HINT : All you have to write is either ```context.sender``` or ```context.attachedDeposit```. 

```ts
 constructor() {
        const rng = new RNG<u32>(1, u32.MAX_VALUE);
        const roll = rng.next();
        this.gameId = roll;
        this.gameState = GameState.Created;
        this.player1 = /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/;
        this.player2 = "";
        this.winner = "";
        this.amount1 = /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/;
        this.amount2 = u128.Zero;
        this.nextPlayer = this.player1;
        this.board = new Array<Row>(3);
        for (let i = 0; i < 3; i++) {
            this.board[i] = new Row(0);
        }
    }
```
Before moving on, take a look at the last line in the constructor. We are initializing the board with zeroes. So zero will indicate that the cell is not marked yet. Cool, let's start with functionality and write our contract's methods!

## Starting with functionality - creating a game
Go to index.ts, this is the file in which our contract's functionality will live. As always, we have to import stuff our contract will need.
```ts
import { context, ContractPromiseBatch, u128 } from "near-sdk-core";
import { Game, Row, games, GameState } from "./models";
```
Now, moving on to writing our first function. Two things for you to do:

Step 1 : Pass the ```Game``` instance as a value to the ```games``` map. 
Step 2 : Return the id of the newly-created game.

```ts
export function createGame(): u32 {
    const game = new Game();
    games.set(game.gameId, /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/);
    /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/;
}
```
Great, not that you can create a game, you should be able to invite others to join, right?

## Joining a game
So you sent your game's id to a friend. This friend (player2) should call a function to join. Let's write this function:

STEP 1 : Fetch the game by ID, it is passed as a aprameter to ```joinGame```.

STEP 2 : We need to save the changes we made to ```game``` in our map, make sure to do it.

HINT for step 2 : We did something similar in the previous subquest. 
```map.set(key, value)```.

```ts
export function joinGame(gameId: u32): string {
    assert(games.contains(gameId), "This game does not exist");
    let game = games.getSome(/*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/);
    assert(game.player2 == "", "This game already has two players");
    assert(game.player1 != context.sender, "You cannot play with yourself");
    game.player2 = context.sender;
    game.amount2 = context.attachedDeposit;
    game.gameState = GameState.InProgress;
    /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/;
    return "Joined!";
}
```
Ok let's continue to our main function!

## Playing - part one
This function is a bit long (28 lines), so we will break it down into three subquests. In this subquest, we will write assertions that have to be met for a user to make changes to the board.

STEP 1 : Make sure that the caller is really the next player.

STEP 2 : Make sure the game is in progress.

HINT for step 2 : Have a look at ```joinGame``` code to see how to access ```GameState``` fields.

```ts
export function play(gameId: u32, row: u32, col: u32): boolean {
    assert(row >= 0 && row < 3 && col >= 0 && col < 3, "Please enter a valid cell");
    assert(games.contains(gameId), "This game does not exist");
    let game = games.getSome(gameId);
    assert(context.sender == game.player1 || context.sender == game.player2, "You are not a player")
    assert(game.nextPlayer == /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/, "It is not your turn");
    assert(game.gameState == /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/, "This game is not on progress");
    let chosen_row = game.board[row];
    assert(chosen_row.data[col] == 0, "This cell has been already marked")
}
```
Now that it is safe to proceed, let's jump into the next subquest!

## playing - part two
Notice that we saved the row which the current player whishes to change (```choden_row```). Now we have to change the target cell, pass the turn, and save whatever changes we made. 

STEP 1 : Check if the caller is player1.

STEP 2 : Pass the turn to the another player.

```ts
if (context.sender == /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/) {
        chosen_row.data[col] = 1;
        game.board[row] = chosen_row;
        game.nextPlayer = game.player2;
    }
    else {
        chosen_row.data[col] = 2;
        game.board[row] = chosen_row;
        /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/;
    }
    games.set(gameId, game);
```
Ok nice, we are ready to finish off this function in the next subquest. But before that a little question for you, can we get rid of the ```chosen_row``` variable altogether?

## playing - part three
How to decide who the winner is? How about we check after each turn if the game is over or not? If the game is over, then the winner is the caller, yeah?

STEP 1 : Set the winner as the caller.

STEP 2 : Mark the game as ```Completed```.

```ts
 const gameIsOver = isGameOver(gameId);
    if (gameIsOver) {
        game.winner =  /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/;
        game.gameState =  /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/;
        games.set(gameId, game);
    }
    return true;
```
But hold one, we haven't implemented this ```isGameOver``` thing. That is for the next subquest my friend, let's do it!

## Checking if the game is over
Nothing new in the following snippet, just some tedious comparisons to figure out if the game is over or not.
```ts
export function isGameOver(gameId: u32): boolean {
    let game = games.getSome(gameId);
    const firstRow = game.board[0];
    const secondRow = game.board[1];
    const thirdRow = game.board[2];
    if (
        isEqual(firstRow.data[0], firstRow.data[1], firstRow.data[2]) ||
        isEqual(secondRow.data[0], secondRow.data[1], secondRow.data[2]) ||
        isEqual(thirdRow.data[0], thirdRow.data[1], thirdRow.data[2]) ||
        isEqual(firstRow.data[0], secondRow.data[0], thirdRow.data[0]) ||
        isEqual(firstRow.data[1], secondRow.data[1], thirdRow.data[1]) ||
        isEqual(firstRow.data[2], secondRow.data[2], thirdRow.data[2]) ||
        isEqual(firstRow.data[0], secondRow.data[1], thirdRow.data[2]) ||
        isEqual(firstRow.data[2], secondRow.data[1], thirdRow.data[0])
    ) {
        return true;
    }
    return false;
}

```
Where is this ```isEqual()``` thing? We will see in the next subquest.

## Some helpful methods
Well. ```isEqual()``` is just a simple function to determine if three ```u8``` parameters are equal or not. Note that we do not count the case when they are zeroes, can you think why?
```ts
export function isEqual(x: u8, y: u8, z: u8): boolean {
    if (x == y && y == z && z != 0) {
        return true;
    }
    return false;
}
```
You would like to know how the board looks like before playing a move, right? Let's write a function to help with that.

STEP 1 : Return the board.

```ts
export function getBoard(gameId: u32): Array<Row> {
    assert(games.contains(gameId), "This game does not exist");
    const game = games.getSome(gameId);
    return /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/;
}
```
The last subquest is coming!

## Claiming the reward
Congrats, you won. So now you want to claim your reward (the summation of your and your opponent's bid). 

STEP 1 : Make sure the caller is the winner.

STEP 2 : Pass two parameters to ```add()```: your bid and your opponent's.

```ts
export function claimReward(gameId: u32): boolean {
    assert(games.contains(gameId), "This game does not exist");
    let game = games.getSome(gameId);
    assert(game.gameState == GameState.Completed, "The game is not over yet");
    assert(context.sender == /*FILL IN THE MISSING CODE SNIPPET HERE(STEP 1)*/, "Only the winner can claim the reward");
    const to_winner = ContractPromiseBatch.create(context.sender);
    const reward = u128.add(/*FILL IN THE MISSING CODE SNIPPET HERE(STEP 2)*/);
    to_winner.transfer(reward);
    games.set(gameId, game);
    return true;
}
```
And we are done!

## Quest Completed
 Congrats friend, you just completed another quest! the web3 community is waiting for your amazing contributions. Keep up the good work and happy coding!