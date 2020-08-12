import React from "react";
import Sketch from "react-p5";

import { range2 } from "../../utils";
import Game, { add, Matrix, Loc, RevealState, RunState } from "./Game";

const CELL_SIZE = 30;

const BG_COL = "#FFE";
const HIDDEN_COL = "#DDD";
const GRID_COL = "#999";
const HOVER_COL = "#AFA7";
const MINE_COL = "#333";
const HINT_COL = "#02F";

// GUI ----

function cellCoords(loc): Loc {
	return [loc[1] * CELL_SIZE, loc[0] * CELL_SIZE];
}

function cellAt(pos) {
	return [Math.floor(pos[1] / CELL_SIZE), Math.floor(pos[0] / CELL_SIZE)];
}

function showMines(p5, mineMatrix, mineIcon) {
	p5.fill(MINE_COL);
	p5.noStroke();
	for (let loc of range2(mineMatrix.rows, mineMatrix.cols)) {
		if (mineMatrix.at(loc)) {
			// p5.image(mineIcon, ...cellCoords(loc), CELL_SIZE, CELL_SIZE);
			p5.ellipse(
				...add(cellCoords(loc), [CELL_SIZE / 2, CELL_SIZE / 2]),
				CELL_SIZE * 0.8
			);
		}
	}
}

function showHints(p5, hintMatrix) {
	p5.fill(HINT_COL);
	p5.noStroke();
	p5.textSize(CELL_SIZE * 0.8);
	p5.textAlign(p5.CENTER);
	for (let loc of range2(hintMatrix.rows, hintMatrix.cols)) {
		if (hintMatrix.at(loc) > 0) {
			let [x, y] = cellCoords(loc);
			p5.text(
				hintMatrix.at(loc),
				x + CELL_SIZE / 2,
				y + CELL_SIZE - p5.textDescent()
			);
		}
	}
}

function showHiddenAndFlaggedSquares(p5, revealedSquaresMatrix, flagIcon) {
	p5.fill(HIDDEN_COL);
	p5.noStroke();
	for (let loc of range2(
		revealedSquaresMatrix.rows,
		revealedSquaresMatrix.cols
	)) {
		if (revealedSquaresMatrix.at(loc) === RevealState.HIDDEN) {
			p5.fill(HIDDEN_COL);
			p5.rect(...cellCoords(loc), CELL_SIZE, CELL_SIZE);
		}
		if (revealedSquaresMatrix.at(loc) === RevealState.FLAGGED) {
			p5.fill(HIDDEN_COL);
			p5.rect(...cellCoords(loc), CELL_SIZE, CELL_SIZE);
			// p5.image(flagIcon, ...cellCoords(loc), CELL_SIZE, CELL_SIZE);
			p5.fill(255, 0, 0);
			p5.rect(
				...add(cellCoords(loc), [CELL_SIZE / 8, CELL_SIZE / 6]),
				(CELL_SIZE * 6) / 8,
				(CELL_SIZE * 4) / 6
			);
		}
	}
}

function showGridLines(p5) {
	p5.stroke(GRID_COL);
	for (let x = CELL_SIZE; x < p5.width; x += CELL_SIZE) {
		p5.line(x, 0, x, p5.height);
	}
	for (let y = CELL_SIZE; y < p5.height; y += CELL_SIZE) {
		p5.line(0, y, p5.width, y);
	}
}

function highlightCell(p5, color, loc) {
	p5.fill(color);
	p5.noStroke();
	p5.rect(...cellCoords(loc), CELL_SIZE, CELL_SIZE);
}

export default function GameDisplay(props) {
	let flagIcon;
	let mineIcon;

	function preload(p5) {
		flagIcon = p5.loadImage("./flag.png");
		mineIcon = p5.loadImage("./mine.png");
	}

	function setup(p5, canvasParentRef) {
		p5.createCanvas(
			props.game.cols * CELL_SIZE,
			props.game.rows * CELL_SIZE
		).parent(canvasParentRef);
	}

	function draw(p5) {
		p5.background(BG_COL);

		showHints(p5, props.game.hintCache);
		showHiddenAndFlaggedSquares(p5, props.game.revealedSquares, flagIcon);
		showGridLines(p5);
		if (props.game.runState === RunState.GAME_RUNNING) {
			highlightCell(p5, HOVER_COL, cellAt([p5.mouseX, p5.mouseY]));
		} else if (props.game.runState === RunState.GAME_WIN) {
			showMines(p5, props.game.mines, mineIcon);
			// p5.fill(255, 150);
			// p5.rect(0, 0, p5.width, p5.height);
			// p5.textAlign(p5.CENTER);
			// p5.textSize(p5.height / 6);
			// p5.fill(0);
			// p5.text("You win!", p5.width / 2, p5.height / 2);
		} else {
			showMines(p5, props.game.mines, mineIcon);
			// p5.fill(255, 150);
			// p5.rect(0, 0, p5.width, p5.height);
			// p5.textSize(p5.height / 6);
			// p5.fill(0);
			// p5.text("Aww...", p5.width / 2, p5.height / 2);
		}
	}

	function mouseReleased(p5) {
		if (
			p5.mouseX >= 0 &&
			p5.mouseX < p5.width &&
			p5.mouseY >= 0 &&
			p5.mouseY < p5.height
		) {
			props.onMouseClick("LEFT", ...cellAt([p5.mouseX, p5.mouseY]));
		}
	}

	function touchEnded(p5) {
		if (
			p5.mouseX >= 0 &&
			p5.mouseX < p5.width &&
			p5.mouseY >= 0 &&
			p5.mouseY < p5.height
		) {
			props.onMouseClick("LEFT", ...cellAt([p5.mouseX, p5.mouseY]));
		}
	}

	function keyPressed(p5) {
		if (p5.key === "f") {
			props.game.toggleFlagged(cellAt([p5.mouseX, p5.mouseY]));
		}
	}

	return (
		<Sketch
			preload={preload}
			setup={setup}
			draw={draw}
			mouseReleased={mouseReleased}
			keyPressed={keyPressed}
			touchEnded={touchEnded}
		/>
	);
}
