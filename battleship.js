// Import required libraries
import fs from 'fs';
import readlineSync from 'readline-sync';
import chalk from 'chalk';

// Declare Variables
let availableMissiles = 30;
let numberOfShips;
let userInput = '';
let gameMap = [];
let trackGamePlay = [];

// Function to read map
function readGameMap(input) {
    let rawMap;
    let readMap = [];
    try {
        rawMap = fs.readFileSync(input, 'utf-8').split('\r\n');
    } catch (error) {
        console.log("An error occured reading file", error.message);
    }

    for (let i = 0; i < rawMap.length; i++) {
        readMap[i] = rawMap[i].split(',');
    }
    return readMap
}

function getShipCount(input) {
    let shipCount=0;
    for (let i=0; i < input.length; i++) {
        for (let j = 0; j<input.length; j++) {
            if (input[i][j] == 1) {
                shipCount += 1;
            }
        }
    }
    return shipCount;
}

// Function to convert user input to coordinates
function userInputToCoordinate(input) {
    const letters = 'ABCDEFGHIJ'
    let stringToArray = [];
    stringToArray = input.split(''); // Split the user input into characters
    let alphaPart = stringToArray[0];
    let alphaToNumeric = letters.indexOf(alphaPart); // Convert the numeric from a string to an integer
    let numericPart = stringToArray.slice(1).join(''); // slice(1) takes out the alphabetic part of the coordinate
    return [parseInt(numericPart)-1, alphaToNumeric];
}

// Functon to validate user input
function isValidCoordinate(input) {
    // Detect blank entry
    if (input.trim() == '') {
        return false;
    }
    let coordinateArray = [];
    coordinateArray = input.split('');
    let charPart = coordinateArray[0];
    let numPart = coordinateArray.slice(1).join('');

    // Convert alpha part to unicode and check if it is within the range A to J
    if (charPart.charCodeAt(0) >= 65 && charPart.charCodeAt(0) <= 74 && numPart >= 0 && numPart <= 9) {
        return true;
    } else {
        return false;
    }
}

// Function to initialize the game and create empty array
function initializeGamePlayArray() {
    const gamePlayArray = Array.from({ length: 10 }, e => Array(10).fill(' '));
    return gamePlayArray;
}

// Function to begin the game prior to play
function beginNewGame() {
    console.log(chalk.blueBright(chalk.bold("Let's play Battleship!")));
    console.log(chalk.green(chalk.bold(`You have ${availableMissiles} missiles to fire to sink all ${numberOfShips}`)));
    printBoard(trackGamePlay);
    console.log(chalk.black(chalk.bold(`You have ${chalk.red(availableMissiles)} missiles remaining!`)));
    console.log(chalk.black(chalk.bold(`You need ${chalk.red(numberOfShips)} more hits to win!`)));
}

// Function to update and print board
function printBoard(array) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let topLabel = '     ';
    let bottomLabel = '';

    for (let k = 0; k < letters.length; k++) {
        topLabel += letters[k] + '  ';
    }
    console.log(chalk.bgGreen(topLabel));

    for (let i = 0; i < array.length; i++) {
        let row = '';

        for (let j = 0; j < array.length; j++) {
            // Alternate colors between white and green
            if (i === 0 || j === 0) {
                row += (` ${array[i][j]} `);
            } else {
                row += (` ${array[i][j]} `);
            }
        }
        if (i<=8) {
            console.log(chalk.bgGreen(i+1 + '  ') + row + chalk.bgGreen('  ')); // Print each row of the board
        }
        else {
            console.log(chalk.bgGreen(i+1 + ' ') + row + chalk.bgGreen('  ')); // Print each row of the board
        }

    }
    for (let i = 0; i < letters.length; i++) {
        bottomLabel += '   ';
    }
    console.log(chalk.bgGreen(bottomLabel + '     '));
}

// Function to shoot missile
function shootMissile(input) {
    if (gameMap[input[0]][input[1]] == 1) {
        return chalk.bold(chalk.red('X'));
    }
    else {
        return chalk.bold(chalk.blue('O'));
    }
}

// Function to validate missile shot
function isValidShot(input) {
    if (trackGamePlay[input[0]][input[1]] == chalk.bold(chalk.red('X')) || trackGamePlay[input[0]][input[1]] == chalk.bold(chalk.blue('O'))) {
        return true;
    } else {
        return false;
    }
}

// Function to update score
function updateScore(input) {
    if (input == chalk.bold(chalk.red('X'))) {
        numberOfShips -= 1;
        availableMissiles -= 1;
    }
    else {
        availableMissiles -= 1;
    }
}

// Function to declare win or lose
function winOrLose() {
    if (numberOfShips == 0) {
        console.log(chalk.grey(chalk.bold(`YOU WIN! - YOU SANK MY ENTIRE FLEET!!`)));
    }
    else {
        console.log(chalk.bold(chalk.blackBright(`YOU LOSE - YOU HAVE ${availableMissiles} MISSILES REMAINING`)));
        console.log(chalk.bold(chalk.cyanBright(`BETTER LUCK NEXT TIME!`)));
    }
}

// Read Map
gameMap = readGameMap('map.txt');

// Get number of ships
numberOfShips = getShipCount(gameMap);

// Generate game play array to store and track user's game play (X's and O's)
trackGamePlay = initializeGamePlayArray();

// Begin new game prior to play
beginNewGame();

// Main game loop
while (availableMissiles != 0 && numberOfShips != 0) {

    // Accept and validate user input
    do {
        console.log(chalk.green("Choose your target (Ex. A1): "));
        userInput = readlineSync.question();
        if (!isValidCoordinate(userInput)) {
            console.log("Invalid input");
        }
    } while (!isValidCoordinate(userInput));

    // Convert user input into coordinate
    let userCoordinate = userInputToCoordinate(userInput);

    // Validate the user's shot (Ensures user does not keep shooting one spot)
    if (!isValidShot(userCoordinate)) {
        trackGamePlay[userCoordinate[0]][userCoordinate[1]] = shootMissile(userCoordinate);

        if (shootMissile(userCoordinate) == chalk.bold(chalk.red('X'))) {
            console.log(chalk.bold(chalk.red(`HIT!!!`)));
            // Update the score
            updateScore(shootMissile(userCoordinate));
        }
        else {
            console.log(chalk.bold(chalk.blueBright(`MISS!!!`)));
            // Update the score
            updateScore(shootMissile(userCoordinate));
        }
    }
    else {
        console.log(chalk.bold(chalk.redBright(`You already shot that coordinate.!!!`)));
    }

    // Update and print the game board
    printBoard(trackGamePlay);
    console.log(chalk.bold(`You have ${chalk.red(availableMissiles)} missiles remaining!`));
    console.log(chalk.bold(`You need ${chalk.red(numberOfShips)} more hits to win`));
}

// Declare the winner or loser
winOrLose();
