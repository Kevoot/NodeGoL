let SerialPort = require('serialport');

config = {
    rows: 24,
    columns: 24,
    waitTime: 0,
    generation: 0,
    ip: "127.0.0.1",
    port: 41234,
    states: {
        dead: { string: "Dead", number: 0 },
        alive: { string: "Alive", number: 1 },
    },
    onTime: "0800",
    offTime: "0600",
    arduinoPort: "COM3",
    debug: true
};

// Open a port to the arduino, Reads port from config
let port = new SerialPort(config.arduinoPort, {
    baudRate: 9600
});

// Open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Error: ', err.message);
})

class Cell {
    constructor(state) {
        this.state = state;
    };

    getState() {
        return this.state;
    };

    setState(state) {
        this.state = state;
    };
};

class Board {
    constructor() {
        this.board = [];
        for (let i = 0; i < config.rows; i++) {
            let arr = [];
            for (let j = 0; j < config.columns; j++) {
                arr.push(new Cell(config.states.dead));
            }
            this.board.push(arr);
        }
    };

    setState(x, y, state) {
        this.board[x][y].setState(state);
    };

    getState(x, y) {
        return this.board[x][y].getState();
    };

    step() {
        let future = new Board();

        for (let i = 1; i < config.rows - 1; i++) {
            for (let j = 1; j < config.columns - 1; j++) {
                // finding no Of Neighbours that are alive
                let aliveNeighbors = 0;

                if (i === 5 && j === 7) {
                    let thing = 0;
                }


                // The cell needs to be subtracted from
                // its neighbours as it was counted before
                for (let m = -1; m <= 1; m++)
                    for (let n = -1; n <= 1; n++) {
                        if (this.board[i + m][j + n].getState() === config.states.alive)
                            aliveNeighbors++;
                    }

                if (this.board[i][j].getState() === config.states.alive) {
                    aliveNeighbors--;
                }

                // Cell is lonely and dies
                if (this.board[i][j].getState() === config.states.alive && (aliveNeighbors < 2)) {
                    future.setState(i, j, config.states.dead);
                }
                // Cell dies due to overpopulation
                else if (this.board[i][j].getState() === config.states.alive && (aliveNeighbors > 3)) {
                    future.setState(i, j, config.states.dead);
                }
                // A new cell is born
                else if (this.board[i][j].getState() === config.states.dead && (aliveNeighbors === 3)) {
                    future.setState(i, j, config.states.alive);
                }
                // Remains the same
                else {
                    future.setState(i, j, this.board[i][j].getState());
                }
            }
        }
        this.board = future.board;
    };
}

let board;
let running, autoplay;

function init() {
    board = new Board();

    board.setState(5, 5, config.states.alive);
    board.setState(4, 6, config.states.alive);
    board.setState(4, 7, config.states.alive);
    board.setState(5, 7, config.states.alive);
    board.setState(6, 7, config.states.alive);
}

function test() {
    board.step();
    sendToController();
}

function sendToController() {
    let data = [];

    let formattedBoard = [];
    for (let i = 0; i < config.rows; i++) {
        let arr = [];
        for (let j = 0; j < (config.columns / 4); j++) {
            arr.push({value: 0});
        }
        formattedBoard.push(arr);
    }

    let counter = 0, unitData = 0;
    for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.columns; j++) {
            if(board.getState(i, j) === config.states.alive) {
                unitData += Math.pow(2, counter);
            }
            counter++;
            if(counter === 4) {
                // Insert at appropriate location
                formattedBoard[i][(((j + 1) / 4) - 1)].value = unitData;
                unitData = 0;
                counter = 0;
            }
        }
    }

    if(config.debug) {
        str = "|";
        for(let i = 0; i < formattedBoard.length; i++) {
            for(let j = 0; j < formattedBoard[i].length; j++) {
                if(formattedBoard[i][j].value <= 9) {
                    str += ("|0" + formattedBoard[i][j].value + "|");
                }
                else str += ("|" + formattedBoard[i][j].value + "|");
            }
            console.log(str);
            str = "|";
        }
    }
            

    port.write(data, (err, bytesWritten) => {
        console.log("Wrote data to arduino");
        console.log("Data: " + data);
    });
}

init();
test();