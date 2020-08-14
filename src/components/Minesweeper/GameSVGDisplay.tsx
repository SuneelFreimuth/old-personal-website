import React from "react";
import styles from "./GameSVGDisplay.module.css";
import { Matrix, RevealState, RunState } from "./Game";
import { range2, unpack } from "../../utils";
import flagIcon from "./icons/flag.svg";
import mineIcon from "./icons/mine.svg";

interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

function centeredRect(x, y, width, height): Rectangle {
	return {
		x: x - width / 2,
		y: y - height / 2,
		width,
		height
	};
}

function Background({ width, height }) {
	return (
		<rect
			x={0}
			y={0}
			width={width}
			height={height}
			className={styles.background}
		/>
	);
}

function GridLines({ tileSize, rows, cols }) {
	const lines: Array<any> = [];
	for (let x = tileSize; x < tileSize * cols; x += tileSize) {
		lines.push(
			<line
				key={`vert${x}`}
				x1={x}
				y1={0}
				x2={x}
				y2={tileSize * rows}
				className={styles.gridLine}
			/>
		);
	}
	for (let y = tileSize; y < tileSize * rows; y += tileSize) {
		lines.push(
			<line
				key={`hor${y}`}
				x1={0}
				y1={y}
				x2={tileSize * cols}
				y2={y}
				className={styles.gridLine}
			/>
		);
	}
	return <>{lines}</>;
}

function Hints({ tileSize, hintMatrix }) {
	const hints: Array<any> = [];
	const fontSize = tileSize * 0.9;
	for (const [r, c] of range2(hintMatrix.rows, hintMatrix.cols)) {
		if (hintMatrix.at([r, c]) > 0) {
			hints.push(
				<text
					key={`hint${r},${c}`}
					x={(c + 0.5) * tileSize}
					y={r * tileSize + tileSize * 0.85}
					className={styles.hint}
					style={{
						fontSize
					}}
				>
					{hintMatrix.at([r, c])}
				</text>
			);
		}
	}
	return <>{hints}</>;
}

function HiddenAndFlaggedSquares({ tileSize, revealMatrix }) {
	const elements: Array<any> = [];
	console.log(revealMatrix);
	for (const [r, c] of range2(revealMatrix.rows, revealMatrix.cols)) {
		const revealState = revealMatrix.at([r, c]);
		if (
			revealState === RevealState.HIDDEN ||
			revealState === RevealState.FLAGGED
		) {
			elements.push(
				<rect
					key={`hidden${r},${c}`}
					x={c * tileSize}
					y={r * tileSize}
					width={tileSize}
					height={tileSize}
					className={styles.hiddenSquare}
				/>
			);
		}
		if (revealState === RevealState.FLAGGED) {
			elements.push(
				<image
					key={`flag${r},${c}`}
					href={flagIcon}
					{...centeredRect(
						(c + 0.5) * tileSize,
						(r + 0.5) * tileSize,
						0.8 * tileSize,
						0.8 * tileSize
					)}
				/>
			);
		}
	}
	return <>{elements}</>;
}

function Mines({ mineMatrix, tileSize }) {
	const mines: Array<any> = [];
	for (const [r, c] of range2(mineMatrix.rows, mineMatrix.cols)) {
		if (mineMatrix.at([r, c])) {
			mines.push(
				<image
					key={`mine${r},${c}`}
					className={`${styles.fadeInFast}`}
					href={mineIcon}
					{...centeredRect(
						(c + 0.5) * tileSize,
						(r + 0.5) * tileSize,
						tileSize * 0.9,
						tileSize * 0.9
					)}
				/>
			);
		}
	}
	return <>{mines}</>;
}

function GameFinish({ mineMatrix, runState, tileSize, width, height }) {
	const fontSize = height / 4;
	const haze = (
		<rect
			className={unpack("gameFinishHaze fadeIn", styles)}
			x={0}
			y={0}
			width={width}
			height={height}
		/>
	);
	if (runState === RunState.GAME_WIN) {
		const classes = `${styles.gameFinishText} ${styles.gameWin} ${styles.fadeIn}`;
		return (
			<>
				<Mines mineMatrix={mineMatrix} tileSize={tileSize} />
				{haze}
				<text
					className={classes}
					x={width / 2}
					y={height / 2 + fontSize / 2}
					style={{
						fontSize
					}}
				>
					You win!
				</text>
			</>
		);
	} else if (runState === RunState.GAME_LOSE) {
		return (
			<>
				<Mines mineMatrix={mineMatrix} tileSize={tileSize} />
				{haze}
				<text
					className={unpack("gameFinishText gameLose fadeIn", styles)}
					x={width / 2}
					y={height / 2 + fontSize / 2}
					style={{
						fontSize
					}}
				>
					Aww...
				</text>
			</>
		);
	}
	return null;
}

export default function GameSVGDisplay({
	game,
	tileSize,
	rows,
	cols,
	onMainClick,
	className
}) {
	console.log(`Display: displaying game of size: ${game.rows} ${game.cols}`);
	console.log(`Display: received size of ${rows} ${cols}`);
	return (
		<svg
			width={tileSize * cols}
			height={tileSize * rows}
			onClick={onMainClick}
			className={className}
		>
			<Background width={tileSize * cols} height={tileSize * rows} />
			<HiddenAndFlaggedSquares
				tileSize={tileSize}
				revealMatrix={game.revealedSquares}
			/>
			<Hints tileSize={tileSize} hintMatrix={game.hintCache} />
			<GridLines tileSize={tileSize} rows={rows} cols={cols} />
			<GameFinish
				runState={game.runState}
				mineMatrix={game.mines}
				tileSize={tileSize}
				width={cols * tileSize}
				height={rows * tileSize}
			/>
		</svg>
	);
}
