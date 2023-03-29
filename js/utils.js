'use strict'

// Returns the class name for a specific cell
function getClassName(position) { // {i:1 , j:3}
	const cellClass = `cell-${position.i}-${position.j}` // 'cell-1-3'
	return cellClass
}

// exmp: object = { i: 2, j: 7 }, value = 'some-value';
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

//return random number include max
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

//return random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// function getEmptyPos() {
//     const emptyPoss = []
//     for (var i = 0; i < gBoard.length; i++) {
//         for (var j = 0; j < gBoard[0].length; j++) {
//             if (gBoard[i][j].type !== WALL && !gBoard[i][j].gameElement) {
//                 emptyPoss.push({ i, j }) // {i:1,j:3}
//             }
//         }
//     }
//     var randIdx = getRandomIntInclusive(0, emptyPoss.length - 1)
//     return emptyPoss[randIdx]
// }