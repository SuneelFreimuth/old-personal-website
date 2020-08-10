import React from "react";
import styles from "./Minesweeper.module.css";

import Sketch from "react-p5";

const CELL_SIZE = 30;
const ROWS = 20;
const COLS = 20;

const BG_COL = "#FFE";
const HIDDEN_COL = "#DDD";
const GRID_COL = "#999";
const HOVER_COL = "#AFA7";
const MINE_COL = "#333";
const HINT_COL = "#02F";

// UTIL ----
function count(iter, pred) {
	let c = 0;
	for (let item of iter) {
		if (pred(item)) c++;
	}
	return c;
}

function add(pair0, pair1) {
	return [pair0[0] + pair1[0], pair0[1] + pair1[1]];
}

function any(pred, iter) {
	for (let item of iter) {
		if (pred(item)) return true;
	}
	return false;
}

function bothOrNeither(bool0, bool1) {
	return (bool0 && bool1) || (!bool0 && !bool1);
}

// MATRIX OPERATIONS ----

function booleanMatrix(rows, cols) {
	const matrix = Array(rows);
	for (let r = 0; r < rows; r++) {
		matrix[r] = Array(cols).fill(false);
	}
	return matrix;
}

function numberMatrix(rows, cols) {
	const matrix = Array(rows);
	for (let r = 0; r < rows; r++) {
		matrix[r] = Array(cols).fill(0);
	}
	return matrix;
}

function at(matrix, loc) {
	return matrix[loc[0]][loc[1]];
}

function set(matrix, loc, val) {
	matrix[loc[0]][loc[1]] = val;
}

const aroundRels = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1]
];

function inBounds(matrix, loc) {
	return (
		0 <= loc[0] &&
		loc[0] < matrix.length &&
		0 <= loc[1] &&
		loc[1] < matrix[0].length
	);
}

function* around(matrix, loc) {
	for (const rel of aroundRels) {
		yield inBounds(matrix, add(loc, rel))
			? at(matrix, add(loc, rel))
			: undefined;
	}
}

function* indAround(loc) {
	for (const rel of aroundRels) {
		yield add(loc, rel);
	}
}

function* range2(rMax, cMax) {
	for (let r = 0; r < rMax; r++) {
		for (let c = 0; c < cMax; c++) {
			yield [r, c];
		}
	}
}

// GAMEPLAY ----

const HIDDEN = 0;
const REVEALED = 1;
const FLAGGED = 2;

const GAME_WIN = 3;
const GAME_LOSE = 4;
const GAME_RUNNING = 5;

function GameState() {
	this.mines = booleanMatrix(ROWS, COLS);
	this.revealedSquares = numberMatrix(ROWS, COLS);
	// Hints are cached so they don't have to be recalculated constantly,
	// even though the hint matrix is technically a pure function of the
	// other game data.
	this.hintCache = numberMatrix(ROWS, COLS);
	// GAME_WIN, GAME_LOSE, or GAME_RUNNING
	this.runState = GAME_RUNNING;
}

function loadRandomMines(mines, chance) {
	for (const loc of range2(ROWS, COLS)) {
		if (Math.random() < chance) {
			set(mines, loc, true);
		}
	}
}

function toggleFlagged(gameState, loc) {
	if (at(gameState.revealedSquares, loc) === HIDDEN) {
		set(gameState.revealedSquares, loc, FLAGGED);
	} else if (at(gameState.revealedSquares, loc) === FLAGGED) {
		set(gameState.revealedSquares, loc, HIDDEN);
	}
}

function revealAllSquares(gameState) {
	for (let loc of range2(ROWS, COLS)) {
		set(gameState.revealedSquares, loc, true);
	}
}

function revealSquaresAround(gameState, loc) {
	if (at(gameState.revealedSquares, loc) !== HIDDEN) return;
	set(gameState.revealedSquares, loc, REVEALED);
	if (any(n => n, around(gameState.mines, loc))) return;
	for (let loc_ of indAround(loc)) {
		if (
			inBounds(gameState.revealedSquares, loc_) &&
			at(gameState.revealedSquares, loc_) === HIDDEN
		) {
			revealSquaresAround(gameState, loc_);
		}
	}
}

function calculateHints(gameState) {
	for (let loc of range2(ROWS, COLS)) {
		if (!at(gameState.mines, loc) && at(gameState.revealedSquares, loc)) {
			const mineCount = count(
				around(gameState.mines, loc),
				x => x === true
			);
			set(gameState.hintCache, loc, mineCount);
		}
	}
}

function checkGameWin(gameState) {
	const mineAt = loc => at(gameState.mines, loc);
	const hiddenOrFlagged = loc =>
		at(gameState.revealedSquares, loc) !== REVEALED;
	for (const loc of range2(ROWS, COLS)) {
		if (!bothOrNeither(mineAt(loc), hiddenOrFlagged(loc))) {
			return false;
		}
	}
	return true;
}

function processMove(gameState, loc) {
	if (
		gameState.runState === GAME_RUNNING &&
		at(gameState.revealedSquares, loc) === HIDDEN
	) {
		if (at(gameState.mines, loc) === true) {
			gameState.runState = GAME_LOSE;
		} else {
			revealSquaresAround(gameState, loc);
			calculateHints(gameState);
			if (checkGameWin(gameState)) {
				gameState.runState = GAME_WIN;
			}
		}
	}
}

// GUI ----

function cellCoords(loc) {
	return [loc[1] * CELL_SIZE, loc[0] * CELL_SIZE];
}

function cellAt(pos) {
	return [Math.floor(pos[1] / CELL_SIZE), Math.floor(pos[0] / CELL_SIZE)];
}

function showMines(p5, mineMatrix, mineIcon) {
	p5.fill(MINE_COL);
	p5.noStroke();
	for (let loc of range2(ROWS, COLS)) {
		if (at(mineMatrix, loc)) {
			// let [x, y] = cellCoords(loc)
			// x += CELL_SIZE/2
			// y += CELL_SIZE/2
			// p5.ellipse(x, y, CELL_SIZE*0.8)
			p5.image(mineIcon, ...cellCoords(loc), CELL_SIZE, CELL_SIZE);
		}
	}
}

function showHints(p5, hintMatrix) {
	p5.fill(HINT_COL);
	p5.noStroke();
	p5.textSize(CELL_SIZE * 0.8);
	p5.textAlign(p5.CENTER);
	for (let loc of range2(ROWS, COLS)) {
		if (at(hintMatrix, loc) > 0) {
			let [x, y] = cellCoords(loc);
			p5.text(
				at(hintMatrix, loc),
				x + CELL_SIZE / 2,
				y + CELL_SIZE - p5.textDescent()
			);
		}
	}
}

function showHiddenAndFlaggedSquares(p5, revealedSquaresMatrix, flagIcon) {
	p5.fill(HIDDEN_COL);
	p5.noStroke();
	for (let loc of range2(ROWS, COLS)) {
		if (at(revealedSquaresMatrix, loc) === HIDDEN) {
			p5.rect(...cellCoords(loc), CELL_SIZE, CELL_SIZE);
		}
		if (at(revealedSquaresMatrix, loc) === FLAGGED) {
			p5.rect(...cellCoords(loc), CELL_SIZE, CELL_SIZE);
			p5.image(flagIcon, ...cellCoords(loc), CELL_SIZE, CELL_SIZE);
		}
	}
}

function showGridLines(p5) {
	p5.stroke(GRID_COL);
	for (let i = CELL_SIZE; i < p5.width; i += CELL_SIZE) {
		p5.line(i, 0, i, p5.height);
		p5.line(0, i, p5.width, i);
	}
}

function highlightCell(p5, col, loc) {
	p5.fill(col);
	p5.noStroke();
	p5.rect(...cellCoords(loc), CELL_SIZE, CELL_SIZE);
}
export default function Minesweeper() {
	let gameState = new GameState();
	loadRandomMines(gameState.mines, 0.1);

	let flagIcon;
	let mineIcon;

	function draw(p5) {
		p5.background(BG_COL);

		showHints(p5, gameState.hintCache);
		showHiddenAndFlaggedSquares(p5, gameState.revealedSquares, flagIcon);
		showGridLines(p5);
		if (gameState.runState === GAME_RUNNING) {
			highlightCell(p5, HOVER_COL, cellAt([p5.mouseX, p5.mouseY]));
		} else if (gameState.runState === GAME_WIN) {
			showMines(p5, gameState.mines, mineIcon);
			p5.fill(255, 150);
			p5.rect(0, 0, p5.width, p5.height);
			p5.textAlign(p5.CENTER);
			p5.textSize(p5.height / 6);
			p5.fill(0);
			p5.text("You win!", p5.width / 2, p5.height / 2);
		} else {
			showMines(p5, gameState.mines, mineIcon);
			p5.fill(255, 150);
			p5.rect(0, 0, p5.width, p5.height);
			p5.textSize(p5.height / 6);
			p5.fill(0);
			p5.text("Aww...", p5.width / 2, p5.height / 2);
		}
	}

	function mouseClicked(p5) {
		switch (gameState.runState) {
			case GAME_RUNNING:
				if (p5.mouseButton === p5.LEFT) {
					processMove(gameState, cellAt([p5.mouseX, p5.mouseY]));
				}
				break;

			case GAME_WIN:
			case GAME_LOSE:
				gameState = new GameState();
				loadRandomMines(gameState.mines, 0.1);
				// let x = [ [0,0], [2,2], [2,0], [17,3], [5,8], [13,16] ]
				// x.map(loc => set(gameState.mines, loc, true))
				break;
		}
	}

	function keyPressed(p5) {
		if (p5.key === "f") {
			toggleFlagged(gameState, cellAt([p5.mouseX, p5.mouseY]));
		}
	}

	function setup(p5, canvasParentRef) {
		p5.createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE).parent(
			canvasParentRef
		);
	}

	function preload(p5) {
		flagIcon = p5.loadImage("./flag.png");
		mineIcon = p5.loadImage("./mine.png");
	}

	return (
		<div className={styles.main}>
			<div className={styles.controls}>
				<label htmlFor="">Rows</label>
				<label htmlFor="">Columns</label>
			</div>
			<Sketch
				preload={preload}
				setup={setup}
				draw={draw}
				mouseClicked={mouseClicked}
				keyPressed={keyPressed}
			/>
		</div>
	);
}
