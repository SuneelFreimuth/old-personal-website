
enum MoveTypes {
    MISS = "MISS",
    HIT  = "HIT",
    BATTLESHIP_SINK = "BATTLESHIP_SINK"
}

interface Move {
    type: MoveTypes,
    turn: number,
    loc: [number, number]
}

export class Player {
    public ships: Array<Array<[number, number]>>
    public hits: Array<[number, number]>
    constructor() {
        this.ships = [
            [
                [1,2],
                [1,3],
                [1,4]
            ]
        ]
        this.hits = [
            [4,5]
        ]
    }

    takeHit(r: number, c: number) {
        this.hits.push([r, c])
    }
}

export class Game {
    public players: Array<Player>
    public turn: number
    public moves: Array<Move>

    constructor() {
        this.players = [
            new Player(),
            new Player()
        ]
        this.turn = 0
        this.moves = []
    }

    makeMove(r, c) {
        this.turn++
        const move = this.players[this.turn].takeHit(r, c)
        // this.moves.push({
        //     type
        // })
        // this.players[this.turn].hits.push(move.loc)
        this.turn = (this.turn + 1) % this.players.length
    }
}