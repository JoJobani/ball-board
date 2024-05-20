'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

// Model:
var gBoard
var gGamerPos
var gBallInterval = null
var gGlueInterval = null
var gCollected = 0
var isGlued = false

function onInitGame() {
	gGamerPos = { i: 2, j: 9 }
	gBoard = buildBoard()
	gBallInterval = setInterval(addBall, 3000)
	gGlueInterval = setInterval(addGlue, 5000)
	renderBoard(gBoard)
}

function buildBoard() {
	// Create the Matrix 10 * 12 
	const board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges 
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			board[i][j] = { type: FLOOR, gameElement: null }
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				board[i][j].type = WALL
			}
		}
	}
	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
	board[2][4].gameElement = BALL
	board[7][6].gameElement = BALL
	board[0][5].type = FLOOR
	board[9][5].type = FLOOR
	board[4][0].type = FLOOR
	board[4][11].type = FLOOR
	return board
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j] // {type,gameElement}

			var cellClass = getClassName({ i: i, j: j }) // 'cell-0-0'
			if (currCell.type === FLOOR) cellClass += ' floor' // 'cell-0-0 floor'
			else if (currCell.type === WALL) cellClass += ' wall' // 'cell-0-0 wall'

			strHTML += '<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >'

			if (currCell.gameElement === GLUE) {
				strHTML += GLUE_IMG
			} else if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '</td>'
		}
		strHTML += '</tr>'
	}

	const elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
	const lastRowIdx = gBoard.length - 1
	const lastColIdx = gBoard[0].length - 1
	if (i < 0) i = lastRowIdx
	if (i > lastRowIdx) i = 0
	if (j < 0) j = lastColIdx
	if (j > lastColIdx) j = 0

	const targetCell = gBoard[i][j]
	if (targetCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	const iAbsDiff = Math.abs(i - gGamerPos.i) // 1 ,2..
	const jAbsDiff = Math.abs(j - gGamerPos.j) // 1 ,7...

	// If the clicked Cell is one of the four allowed
	if (!isGlued) {
		if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)
			|| (iAbsDiff === lastRowIdx) || (jAbsDiff === lastColIdx)) {
			if (targetCell.gameElement === BALL) {
				gCollected++
				var eCollected = document.querySelector(".collect")
				eCollected.innerHTML = `Collected: ${gCollected}`
				var audio = new Audio('plop.wav')
				audio.play()
			}
			if (targetCell.gameElement === GLUE) {
				isGlued = true
				setTimeout(() => {
					isGlued = false
				}, 3000)
			}
			// Move the gamer
			// Moving from current position:
			// Model:
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

			// Dom:
			renderCell(gGamerPos, '')

			// Moving to selected position:
			// Model:
			gBoard[i][j].gameElement = GAMER
			gGamerPos.i = i
			gGamerPos.j = j

			// Dom:
			renderCell(gGamerPos, GAMER_IMG)



		} else console.log('TOO FAR', iAbsDiff, jAbsDiff)
		findAdj()
	}
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	const cellSelector = '.' + getClassName(location)
	const elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
	// console.log('event:', event)
	const i = gGamerPos.i // 2
	const j = gGamerPos.j // 9

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1)
			break
		case 'ArrowRight':
			moveTo(i, j + 1)
			break
		case 'ArrowUp':
			moveTo(i - 1, j)
			break
		case 'ArrowDown':
			moveTo(i + 1, j)
			break
	}
}

// Returns the class name for a specific cell
function getClassName(location) { // {i:2,j:4}
	const cellClass = `cell-${location.i}-${location.j}` // 'cell-2-4'
	return cellClass
}

function getEmptyCells() {
	var emptyCells = []
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			if ((gBoard[i][j].type === 'FLOOR') && (!gBoard[i][j].gameElement)) {
				emptyCells.push(gBoard[i][j])
			}
		}
	}
	return emptyCells
}

function addBall() {
	var emptyCells = getEmptyCells()
	if (emptyCells.length === 0) return
	var randCell = emptyCells[getRandomInt(0, emptyCells.length)]
	randCell.gameElement = BALL
	findAdj()
	renderBoard(gBoard)
}

function addGlue() {
	var emptyCells = getEmptyCells()
	if (emptyCells.length === 0) return
	var randCell = emptyCells[getRandomInt(0, emptyCells.length)]
	randCell.gameElement = GLUE
	setTimeout(() => {
		if (isGlued) return
		randCell.gameElement = null
	}, 3000)
	renderBoard(gBoard)
}

function findAdj() {
	var adjacent = 0
	var iPos = gGamerPos.i
	var jPos = gGamerPos.j
	for (var i = iPos - 1; i <= iPos + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue
		for (var j = jPos - 1; j <= jPos + 1; j++) {
			if (j < 0 || j >= gBoard[i].length) continue
			if (i === iPos && j === jPos) continue
			if (gBoard[i][j].gameElement === BALL) {
				adjacent++
			}
		}
	}
	var eAdj = document.querySelector('.adj')
	eAdj.innerHTML = `Adjacent balls: ${adjacent}`
}