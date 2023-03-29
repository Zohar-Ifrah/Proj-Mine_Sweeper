'use strict'
const FLAG = '🚩'
const MINE = '<img src="img/mine.png" alt="">'
var gBoard = []
var gLevel = {
    SIZE: 4,
    MINES: 2
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
    console.dir(gBoard)
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
    board[0][0] = { minesAroundCount: 0, isShown: false, isMine: true, isMarked: false }
    board[0][2] = { minesAroundCount: 0, isShown: false, isMine: true, isMarked: false }
    board[1][0] = { minesAroundCount: 4, isShown: false, isMine: true, isMarked: true }
    setMinesNegsCount(board)
    // board[1][2] = { minesAroundCount: 4, isShown: false, isMine: true, isMarked: true }
    return board
}
// Count mines around each cell and set the cell's minesAroundCount. 
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            checkForNegs(board, i, j)
        }
    }
}
function checkForNegs(board, cellI, cellJ) {
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
// Render a <table> board to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) // 'cell-3-4'
            if (currCell.isMine) cellClass += ' mine'
            // else cellClass = ''
            if (currCell.isShown) cellClass += ' Shown'
            strHTML += `\t<td class="cell ${cellClass}" 
                onclick="onCellClicked(this,${i},${j})">`
            if (currCell.isShown) {
                if (currCell.isMine) strHTML += MINE
                else strHTML += currCell.minesAroundCount
            }
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board-container')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {

    var loc = { i: i, j: j }
    console.log(loc)
    console.log(elCell)

}

function onCellMarked(elCell) {
    //  Called when a cell is right- clicked  
    //  See how you can hide the context menu on right click 
}

function checkGameOver() {
    // Game ends when all mines are marked, and all the other cells are shown 
}

function expandShown(board, elCell, i, j) {
    // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
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