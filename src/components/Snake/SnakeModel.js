import * as R from 'ramda'

const mod = x => y => (y >= 0) ? y % x : (y % x) + x

const NORTH = [ 0, -1]
const EAST  = [ 1,  0]
const SOUTH = [ 0,  1]
const WEST  = [-1,  0]

const randPos = (numCols, numRows) => [numCols * Math.random(), numRows * Math.random()].map(Math.floor)
const addPairs = (x, y) => R.zipWith(R.add, x, y)

const bound = (p, numCols, numRows) => [ mod(numCols)(p[0]), mod(numRows)(p[1]) ]
const nextHead = state => bound(addPairs(R.head(state.snake), state.moves[0]),
    state.cols, state.rows)

const willEat = state => R.equals(nextHead(state), state.apple)
const willCrash = state => R.contains(nextHead(state), state.snake)

const updateSnake = state => willEat(state) ?
    R.prepend(nextHead(state), state.snake) :
    R.dropLast(1, R.prepend(nextHead(state), state.snake))
const updateApple = state => willEat(state) ? randPos(state.cols, state.rows) : state.apple
const updateMoves = state => state.moves.length > 1 ? R.drop(1, state.moves) : state.moves

const enqueueMove = (state, move) => !R.equals(addPairs(move, state.moves[0]), [0,0]) ? 
    R.assoc('moves', R.append(move, state.moves), state) : state;

const initialState = {
    apple: [6,6],
    snake: [[1,1]],
    moves: [EAST],
    rows: 10,
    cols: 10
}

const nextState = initial => state => !willCrash(state) ? R.applySpec({
    apple: updateApple,
    snake: updateSnake,
    moves: updateMoves,
    rows: R.prop('rows'),
    cols: R.prop('cols')
})(state) : initial;

export { initialState, nextState, enqueueMove, NORTH, EAST, SOUTH, WEST, }