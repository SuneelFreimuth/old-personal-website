import React, { useState } from "react";
import Sketch from "react-p5";

import styles from "./Minesweeper.module.css";
import GameDisplay from "./GameDisplay";
import GameSVGDisplay from "./GameSVGDisplay";
import MinesweeperGame, { RunState } from "./Game";
import { constrain, unpack } from "../../utils";

enum MouseButtons {
	LEFT,
	MIDDLE,
	RIGHT,
	BROWSER_BACK,
	BROWSER_FORWARD
}

enum FormDataErrors {
	NOT_NUMBERS
}

export default function Minesweeper() {
	const [rows, setRows] = useState<number>(20);
	const [cols, setCols] = useState<number>(20);
	const [game, setGame] = useState<MinesweeperGame | null>(null);

	function onRowsChange(e) {
		setRows(e.target.value);
	}

	function onColsChange(e) {
		setCols(e.target.value);
	}

	function gameDisplayMouseClick(shiftKey, r, c) {
		if (game !== null) {
			console.log(`Making move at tile ${r},${c}`);
			let game_: MinesweeperGame | null = game.clone();
			switch ((game_ as MinesweeperGame).runState) {
				case RunState.GAME_RUNNING:
					if (shiftKey) {
						(game_ as MinesweeperGame).toggleFlagged([r, c]);
					} else {
						(game_ as MinesweeperGame).processMove([r, c]);
					}
					break;
				case RunState.GAME_WIN:
				case RunState.GAME_LOSE:
					game_ = null;
					break;
			}
			setGame(game_);
		}
	}

	function validateFormData(): boolean {
		const r = Number(rows);
		const c = Number(cols);
		console.log(r, c);
		if (!isNaN(r) && !isNaN(c)) {
			setRows(constrain(r, 0, 500));
			setCols(constrain(c, 0, 500));
			return true;
		}
		return false;
	}

	function startGame() {
		const success = validateFormData();
		if (success) {
			console.log(`Starting game with size ${rows} ${cols}...`);
			const newGame = new MinesweeperGame(rows, cols, 0.1);
			setGame(newGame);
		}
	}

	function showControls(controlsVisible: boolean) {
		if (controlsVisible) {
			return (
				<GameControls
					rows={rows}
					cols={cols}
					onRowsChange={onRowsChange}
					onColsChange={onColsChange}
					onSubmit={startGame}
				/>
			);
		}
	}

	function showGame(gameVisible: boolean) {
		if (gameVisible) {
			return (
				<div className={styles.gameDisplayBox}>
					<GameSVGDisplay
						game={game}
						tileSize={40}
						rows={rows}
						cols={cols}
						onMainClick={e =>
							gameDisplayMouseClick(...getClickData(e))
						}
						className={styles.gameDisplay}
					/>
				</div>
			);
		}
		return null;
	}

	function getClickData(e): [boolean, number, number] {
		const rect = e.currentTarget.getBoundingClientRect();
		const r = Math.floor((e.pageY - rect.y) / 40);
		const c = Math.floor((e.pageX - rect.x) / 40);
		return [e.shiftKey, r, c];
	}

	const heightClass = game === null ? "fullHeight" : "naturalHeight";

	return (
		<div className={unpack(`main fullHeight`, styles)}>
			<h1 className={styles.title}>Minesweeper</h1>
			{game !== null ? (
				<p style={{ fontSize: "1.4rem" }}>
					Shift+click to place flags. Good luck!
				</p>
			) : null}
			{showControls(game === null)}
			{showGame(game !== null)}
		</div>
	);
}

function GameControls({ rows, cols, onSubmit, onRowsChange, onColsChange }) {
	return (
		<div className={styles.controls}>
			<p>
				NOTE: Things may look weird for crazy row/column ratios. On the
				to-do list.
			</p>
			<label htmlFor="rows">Rows</label>
			<input type="text" id="rows" value={rows} onChange={onRowsChange} />
			<br />
			<label htmlFor="">Columns</label>
			<input type="text" id="cols" value={cols} onChange={onColsChange} />
			<br />
			<button onClick={onSubmit}>Start game!</button>
		</div>
	);
}
