import {xor, range, range2, count, any} from '../../utils'

export type Loc = [number, number]

export class Matrix<ElemType> {
	rows: number
	cols: number
	data: Array<Array<ElemType>>

	constructor(fillVal: ElemType | null, rows: number, cols: number) {
		this.rows = rows
		this.cols = cols
		this.data = new Array(rows)
		for (const i of range(rows)) {
			this.data[i] = new Array(cols).fill(fillVal)
		}
	}

	at(loc: Loc): ElemType {
		return this.data[loc[0]][loc[1]]
	}

	set(loc: Loc, val: ElemType) {
		this.data[loc[0]][loc[1]] = val
	}

	inBounds(loc: Loc): boolean {
		return loc[0] >= 0 && loc[0] < this.rows && loc[1] >= 0 && loc[1] < this.cols
	}

	clone(): Matrix<ElemType> {
		const newData = new Array(this.rows)
		for (const r of range(this.rows)) {
			newData[r] = new Array(this.cols)
			for (const c of range(this.cols)) {
				newData[r][c] = this.data[r][c]
			}
		}
		const newMatrix = new Matrix<ElemType>(null, this.rows, this.cols)
		newMatrix.data = newData
		return newMatrix
	}
}

const aroundRels: Array<Loc> = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1]
];

export function add(pair0: Loc, pair1: Loc): Loc {
	return [pair0[0] + pair1[0], pair0[1] + pair1[1]];
}

function* around(matrix: Matrix<any>, loc: Loc) {
	for (const rel of aroundRels) {
		yield matrix.inBounds(add(loc, rel))
			? matrix.at(add(loc, rel))
			: undefined;
	}
}

function* indAround(loc: Loc) {
	for (const rel of aroundRels) {
		yield add(loc, rel);
	}
}


export enum RevealState {
	HIDDEN,
	REVEALED,
	FLAGGED,
}

export enum RunState {
	GAME_WIN,
	GAME_LOSE,
	GAME_RUNNING,
}

export default class MinesweeperGame {
	readonly rows: number
	readonly cols: number
	mines: Matrix<boolean>
	revealedSquares: Matrix<RevealState>
	hintCache: Matrix<number>
	runState: RunState

	constructor(rows: number, cols: number) {
		this.rows = rows
		this.cols = cols
		this.mines = new Matrix<boolean>(false, rows, cols)
		this.revealedSquares = new Matrix<RevealState>(RevealState.HIDDEN, rows, cols)
		this.hintCache = new Matrix<number>(0, rows, cols)
		this.runState = RunState.GAME_RUNNING
	}

	clone(): MinesweeperGame {
		const newGame = new MinesweeperGame(this.rows, this.cols)
		newGame.mines = this.mines.clone()
		newGame.revealedSquares = this.revealedSquares.clone()
		newGame.hintCache = this.hintCache.clone()
		newGame.runState = this.runState
		return newGame
	}

	inBounds(loc: Loc): boolean {
		return loc[0] >= 0 && loc[0] < this.rows && loc[1] >= 0 && loc[1] < this.cols
	}

	loadRandomMines(chance: number) {
		for (const loc of range2(this.rows, this.cols)) {
			if (Math.random() < chance) {
				this.mines.set(loc, true);
			}
		}
	}

	toggleFlagged(loc: Loc) {
		if (this.revealedSquares.at(loc) === RevealState.HIDDEN) {
			this.revealedSquares.set(loc, RevealState.FLAGGED)
		} else if (this.revealedSquares.at(loc) === RevealState.FLAGGED) {
			this.revealedSquares.set(loc, RevealState.HIDDEN)
		}
	}

	revealAllSquares() {
		for (const loc of range2(this.rows, this.cols)) {
			this.revealedSquares.set(loc, RevealState.REVEALED)
		}
	}

	revealSquaresAround(loc: Loc) {
		if (this.revealedSquares.at(loc) !== RevealState.HIDDEN)
			return;
		this.revealedSquares.set(loc, RevealState.REVEALED)
		if (any(n => n, around(this.mines, loc)))
			return;
		for (let loc_ of indAround(loc)) {
			if (this.inBounds(loc_) &&
				this.revealedSquares.at(loc_) === RevealState.HIDDEN)
			{
				this.revealSquaresAround(loc_);
			}
		}
	}

	calculateHints() {
		for (let loc of range2(this.rows, this.cols)) {
			if (!this.mines.at(loc) && this.revealedSquares.at(loc)) {
				const mineCount = count(x => x === true, around(this.mines, loc));
				this.hintCache.set(loc, mineCount);
			}
		}
	}

	checkGameWin(): boolean {
		const mineAt = loc => this.mines.at(loc);
		const hiddenOrFlagged = loc =>
			this.revealedSquares.at(loc) !== RevealState.REVEALED;
		for (const loc of range2(this.rows, this.cols)) {
			if (!xor(mineAt(loc), hiddenOrFlagged(loc))) {
				return false;
			}
		}
		return true;
	}

	processMove(loc) {
		if (this.runState === RunState.GAME_RUNNING &&
			this.revealedSquares.at(loc) === RevealState.HIDDEN)
		{
			if (this.mines.at(loc)) {
				this.runState = RunState.GAME_LOSE;
			} else {
				this.revealSquaresAround(loc);
				this.calculateHints();
				if (this.checkGameWin()) {
					this.runState = RunState.GAME_WIN;
				}
			}
		}
	}
}
