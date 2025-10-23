/**
 * Business: Multiplayer game server for Battleship
 * Args: event with httpMethod, body, queryStringParameters; context with requestId
 * Returns: HTTP response with game state and actions
 */

const gameRooms = new Map();
const playerRooms = new Map();

function generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyBoard() {
    return Array(10).fill(null).map(() => Array(10).fill('empty'));
}

module.exports.handler = async (event, context) => {
    const { httpMethod, body, queryStringParameters } = event;

    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            body: '',
            isBase64Encoded: false
        };
    }

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    try {
        if (httpMethod === 'POST') {
            const action = queryStringParameters?.action;
            const data = body ? JSON.parse(body) : {};

            if (action === 'join') {
                const playerId = data.playerId || `player_${Date.now()}`;
                const playerName = data.playerName || 'Игрок';

                let roomId = playerRooms.get(playerId);
                let room;

                if (roomId) {
                    room = gameRooms.get(roomId);
                }

                if (!room || room.status !== 'waiting') {
                    const waitingRoomEntry = Array.from(gameRooms.entries()).find(
                        ([_, r]) => r.status === 'waiting' && r.players.filter(p => p).length < 2
                    );

                    if (waitingRoomEntry) {
                        room = waitingRoomEntry[1];
                        roomId = waitingRoomEntry[0];
                    } else {
                        roomId = generateRoomId();
                        room = {
                            id: roomId,
                            players: [],
                            currentTurn: 0,
                            status: 'waiting',
                            createdAt: Date.now()
                        };
                        gameRooms.set(roomId, room);
                    }
                }

                const playerIndex = room.players.findIndex(p => p?.id === playerId);
                const newPlayer = {
                    id: playerId,
                    name: playerName,
                    board: data.board || createEmptyBoard(),
                    shots: createEmptyBoard(),
                    isReady: false
                };

                if (playerIndex >= 0) {
                    room.players[playerIndex] = newPlayer;
                } else {
                    if (!room.players[0]) {
                        room.players[0] = newPlayer;
                    } else if (!room.players[1]) {
                        room.players[1] = newPlayer;
                    }
                }

                playerRooms.set(playerId, roomId);

                return {
                    statusCode: 200,
                    headers,
                    isBase64Encoded: false,
                    body: JSON.stringify({
                        roomId,
                        playerId,
                        playerIndex: room.players.findIndex(p => p?.id === playerId),
                        playersCount: room.players.filter(p => p).length,
                        status: room.status
                    })
                };
            }

            if (action === 'ready') {
                const { roomId, playerId } = data;
                const room = gameRooms.get(roomId);

                if (!room) {
                    return {
                        statusCode: 404,
                        headers,
                        isBase64Encoded: false,
                        body: JSON.stringify({ error: 'Комната не найдена' })
                    };
                }

                const player = room.players.find(p => p?.id === playerId);
                if (player) {
                    player.isReady = true;
                }

                if (room.players.length === 2 && room.players.every(p => p?.isReady)) {
                    room.status = 'playing';
                }

                return {
                    statusCode: 200,
                    headers,
                    isBase64Encoded: false,
                    body: JSON.stringify({
                        success: true,
                        status: room.status
                    })
                };
            }

            if (action === 'shoot') {
                const { roomId, playerId, row, col } = data;
                const room = gameRooms.get(roomId);

                if (!room || room.status !== 'playing') {
                    return {
                        statusCode: 400,
                        headers,
                        isBase64Encoded: false,
                        body: JSON.stringify({ error: 'Игра недоступна' })
                    };
                }

                const playerIndex = room.players.findIndex(p => p?.id === playerId);
                if (playerIndex !== room.currentTurn) {
                    return {
                        statusCode: 400,
                        headers,
                        isBase64Encoded: false,
                        body: JSON.stringify({ error: 'Не ваш ход' })
                    };
                }

                const opponentIndex = playerIndex === 0 ? 1 : 0;
                const opponent = room.players[opponentIndex];
                const player = room.players[playerIndex];

                if (!opponent || !player) {
                    return {
                        statusCode: 400,
                        headers,
                        isBase64Encoded: false,
                        body: JSON.stringify({ error: 'Противник не найден' })
                    };
                }

                if (player.shots[row][col] !== 'empty') {
                    return {
                        statusCode: 400,
                        headers,
                        isBase64Encoded: false,
                        body: JSON.stringify({ error: 'Уже стреляли сюда' })
                    };
                }

                const isHit = opponent.board[row][col] === 'ship';
                player.shots[row][col] = isHit ? 'hit' : 'miss';
                opponent.board[row][col] = isHit ? 'hit' : opponent.board[row][col];

                const allShipsSunk = opponent.board.every((row) =>
                    row.every((cell) => cell !== 'ship')
                );

                if (allShipsSunk) {
                    room.status = 'finished';
                    room.winner = playerId;
                }

                if (!isHit) {
                    room.currentTurn = opponentIndex;
                }

                return {
                    statusCode: 200,
                    headers,
                    isBase64Encoded: false,
                    body: JSON.stringify({
                        hit: isHit,
                        nextTurn: room.currentTurn,
                        gameOver: room.status === 'finished',
                        winner: room.winner
                    })
                };
            }
        }

        if (httpMethod === 'GET') {
            const roomId = queryStringParameters?.roomId;
            const playerId = queryStringParameters?.playerId;

            if (roomId) {
                const room = gameRooms.get(roomId);

                if (!room) {
                    return {
                        statusCode: 404,
                        headers,
                        isBase64Encoded: false,
                        body: JSON.stringify({ error: 'Комната не найдена' })
                    };
                }

                const playerIndex = room.players.findIndex(p => p?.id === playerId);

                return {
                    statusCode: 200,
                    headers,
                    isBase64Encoded: false,
                    body: JSON.stringify({
                        roomId: room.id,
                        status: room.status,
                        playersCount: room.players.filter(p => p).length,
                        currentTurn: room.currentTurn,
                        playerIndex,
                        isYourTurn: room.currentTurn === playerIndex,
                        opponentShots: playerIndex >= 0 && room.players[playerIndex === 0 ? 1 : 0] 
                            ? room.players[playerIndex === 0 ? 1 : 0]?.shots 
                            : createEmptyBoard(),
                        yourShots: playerIndex >= 0 && room.players[playerIndex]
                            ? room.players[playerIndex]?.shots
                            : createEmptyBoard(),
                        winner: room.winner
                    })
                };
            }

            return {
                statusCode: 200,
                headers,
                isBase64Encoded: false,
                body: JSON.stringify({
                    activeRooms: gameRooms.size,
                    waitingRooms: Array.from(gameRooms.values()).filter(r => r.status === 'waiting').length
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            isBase64Encoded: false,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            isBase64Encoded: false,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
