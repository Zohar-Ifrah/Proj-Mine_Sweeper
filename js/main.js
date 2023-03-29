'use strict'
const FLAG = '🚩'
const MINE = '<img src="img/mine.png" alt="">'

// var gSmallHint = []
var gLives = 3
var gBoard = []

var gLevel = {
    SIZE: 8,
    MINES: 14
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)
    console.log(gBoard)
}

// Render a <table> board to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) // 'cell-3-4'
            // if (currCell.isMine) cellClass += ' mine'
            // else cellClass = ''
            // if (currCell.isShown) cellClass += ' Shown'
            strHTML += `\t<td class="cell ${cellClass}" 
                onclick="onCellClicked(this,${i},${j})" 
                oncontextmenu="onCellRightClicked(this, ${i}, ${j}); return false;">`
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board-container')
    elBoard.innerHTML = strHTML
}

// Builds the board   Set the mines Call setMinesNegsCount() Return the created board
function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    getRandomMines(gLevel.MINES, board)
    setMinesNegsCount(board)
    // board[1][0] = { minesAroundCount: 0, isShown: false, isMine: true, isMarked: false }
    // board[0][3] = { minesAroundCount: 0, isShown: false, isMine: true, isMarked: false }
    // board[1][0] = { minesAroundCount: 4, isShown: false, isMine: true, isMarked: true }
    // board[1][2] = { minesAroundCount: 4, isShown: false, isMine: true, isMarked: true }
    return board
}

// Count mines around each cell and set the cell's minesAroundCount. 
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            checkForNegsMines(board, i, j)
        }
    }
}

function checkForNegsMines(board, cellI, cellJ) {
    // if (board[cellI][cellJ].isMine) return   // if dont want to count minesAroundCount on MINES >> Rmove//
    var minesAmount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (i === cellI && j === cellJ) continue
            if (board[i][j].isMine) {
                minesAmount++
            }
        }
    }
    board[cellI][cellJ].minesAroundCount = minesAmount
}

// RIGHT Click
function onCellRightClicked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        elCell.innerText = ''
    } else {
        gBoard[i][j].isMarked = true
        elCell.innerText = FLAG
        checkGameOver()
    }

}
// LEFT Click >> if not flaged reveals number or clean spots + clean negs. OR >> found mmine and end
function onCellClicked(elCell, i, j) {                  // maybe later need elCell
    if (gBoard[i][j].isMarked) return //if Flaged cant reveal

    // if (elCell.classList.contains('mine')) renderCell(loc, MINE)   // if needs elCell

    var currCellIdx = { i: i, j: j }
    if (gBoard[i][j].isMine) { // MINE Found
        renderCell(currCellIdx, MINE)
        if (gLives > 0){
            gLives--
            console.log(`Life left: ${gLives}`)
            return
        }
        else gLives--
        console.log('End..............')
        return 
    }
    if (gBoard[i][j].minesAroundCount) renderCell(currCellIdx, gBoard[i][j].minesAroundCount) // Spot with num
    else { // reveals clean spot + reveals all around
        gBoard[i][j].isShown = true
        expandShown(gBoard, elCell, i, j)
    }
    // anyway reveals current cell (if found mine ending game)
    elCell.classList.add('shown')
    gBoard[i][j].isShown = true
    checkGameOver()
}

function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (i === cellI && j === cellJ) continue
            if (!gBoard[i][j].minesAroundCount) {
                var elNegCell = document.querySelector(`.cell-${i}-${j}`)
                elNegCell.classList.add('shown')
                board[i][j].isShown = true
                if (board[i][j].isMarked) elNegCell.innerText = ''
            }
        }
    }
}

function onCellMarked(elCell) {
    //  Called when a cell is right- clicked  
    //  See how you can hide the context menu on right click 
}

// function checkGameOver() {
// }

function checkGameOver() {
    var countMines = 0
    var countShown = 0
    var countFlags = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMarked) {
                countFlags++
                if (gBoard[i][j].isMine) countMines++
            }
        }
    }
    if (countFlags > countMines) return
    if (countMines === gLevel.MINES) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isShown) countShown++
            }
        }
    }
    if (countShown === gLevel.SIZE ** 2 - gLevel.MINES) win()
}

function getEmptyPos() {
    const emptyPoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].type !== WALL && !gBoard[i][j].gameElement) {
                emptyPoss.push({ i, j }) // {i:1,j:3}
            }
        }
    }
    var randIdx = getRandomIntInclusive(0, emptyPoss.length - 1)
    return emptyPoss[randIdx]
}

function getRandomMines(maxMines, board) { // sets mines by gLevel SIZE/MINES
    while (maxMines > 0) { // runs until got the number of mine requested
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (maxMines > 0 && Math.random() < gLevel.MINES / gLevel.SIZE ** 2) {
                    maxMines--;
                    board[i][j].isMine = true
                }
            }
        }
    }
}

function win() {
    console.log('Win!!!!!!!')
}

function playAgian(){
    console.log('Play agin')
}


