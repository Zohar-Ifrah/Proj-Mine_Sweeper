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
    gGame.isOn = true
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
            strHTML += `\t<td class="cell ${cellClass}" 
                onclick="onCellClicked(this,${i},${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;">`
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
    // getRandomMines(gLevel.MINES, board)
    // setMinesNegsCount(board)
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
    if (board[cellI][cellJ].isMine) return   // if dont want to count minesAroundCount on MINES >> Rmove//
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
function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
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
function onCellClicked(elCell, i, j) {                  ///////////////////////////////// maybe later need elCell

    if (!gGame.isOn) return //if game off (lose / win) unable moves

    if (!checkShown()) { // for first click:
        getRandomMines(gLevel.MINES, gBoard, { i: i, j: j })
        setMinesNegsCount(gBoard)
    }

    if (gBoard[i][j].isMarked) return //if Flaged cant reveal

    var currCellIdx = { i: i, j: j }
    if (gBoard[i][j].isMine) { // MINE Found
        renderCell(currCellIdx, MINE)  // reveal Mine
        var elLives = document.querySelector('.lives span')
        var elResetBtn = document.querySelector('.reset-btn')
        gLives--
        elLives.innerText = gLives
        gGame.isOn = false
        revealMines(getMines())
        elResetBtn.innerHTML = '<img src="img/lose.gif" alt="">'
        // if (gLives === 0)  //// for later adding//////////
        return
    }
    if (gBoard[i][j].minesAroundCount) {// Spot with number
        renderCell(currCellIdx, gBoard[i][j].minesAroundCount)
    } else { // reveals clean spot + reveals all around
        // gBoard[i][j].isShown = true
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

function getRandomMines(maxMines, board, mineFreeIdx) { // sets mines by gLevel SIZE/MINES
    while (maxMines > 0) { // runs until got the number of mine requested
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (mineFreeIdx.i !== i && mineFreeIdx.j !== j && !board[i][j].isMine) {
                    if (maxMines > 0 && Math.random() < gLevel.MINES / gLevel.SIZE ** 2) {
                        maxMines--
                        board[i][j].isMine = true
                    }
                }
            }
        }
    }
}

function win() {
    console.log('Win!!!!!!!')
    var elResetBtn = document.querySelector('.reset-btn')
    elResetBtn.innerHTML = '<img src="img/win.jpg" alt="">'
}

function resetGame() {
    var elResetBtn = document.querySelector('.reset-btn')
    elResetBtn.innerHTML = '<img src="img/happy.jpg" alt="">'
    gGame.isOn = true
    if (gLives > 0) {  // If didnt lose all lives
        gBoard = buildBoard()
        renderBoard(gBoard)
    } else {
        gBoard = buildBoard()
        renderBoard(gBoard)
        gLives = 3
    }
}

function getMines() {
    var minesIdx = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                minesIdx.push({ i: i, j: j })
            }
        }
    }
    if (minesIdx.length === 0) return null
    return minesIdx
}

function revealMines(minesIdx) {
    var currCell = {}
    for (var i = 0; i < minesIdx.length; i++) {
        currCell = minesIdx[i]
        renderCell(currCell, MINE)
    }
}

function resetHTML() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerText = ''
                if (elCell.classList.contains('shown')) elCell.classList.remove('shown')
            }
        }
    }
}

function checkShown() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isShown) {
                return true
            }
        }
    }
    return false
}

function selectMode(elBtn) { //reset the board to the mode request 

    // clearInterval(gInterval)
    // resetGameTime()
    switch (elBtn.innerText) {
        case 'Beginner(16)':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            onInit()
            break
        case 'Medium(64)':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            onInit()
            break
        case 'Expert!(144)':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            onInit()
            break
        default:
            break;
    }
}
