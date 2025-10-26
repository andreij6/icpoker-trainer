import { describe, it, expect } from 'vitest';
import { GameState, Player, Card, Suit, GamePhase, PlayerStatus } from '../src/types';
import { 
  startNewHand, 
  fold, 
  call, 
  raise, 
  endHand,
  BIG_BLIND,
  SMALL_BLIND
} from '../src/utils/gameActions';
import { createDeck, shuffleDeck } from '../src/utils/deck';

/**
 * Pot Logic Test Suite
 * 
 * Comprehensive tests for pot calculations, side pots, and pot awarding
 */

describe('Pot Logic - Simple Pots', () => {
  
  function createTestPlayer(id: number, stack: number, cards?: [Card, Card]): Player {
    return {
      id,
      name: `Player ${id}`,
      avatarUrl: '',
      stack,
      cards,
      status: PlayerStatus.Active,
      isEliminated: false,
    };
  }

  function createCard(rank: string, suit: Suit): Card {
    return { rank, suit };
  }

  it('should award pot to winner in simple two-player scenario', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000, [
        createCard('A', Suit.Spades),
        createCard('K', Suit.Spades)
      ]),
      createTestPlayer(2, 1000, [
        createCard('Q', Suit.Hearts),
        createCard('J', Suit.Hearts)
      ]),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [
        createCard('A', Suit.Hearts),
        createCard('K', Suit.Hearts),
        createCard('Q', Suit.Diamonds),
        createCard('J', Suit.Diamonds),
        createCard('2', Suit.Clubs),
      ],
      pot: 200,
      gamePhase: GamePhase.RIVER,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = endHand(state);

    expect(state.pot).toBe(0); // Pot awarded
    expect(state.players[0].stack).toBe(1200); // Winner gets pot
    expect(state.players[1].stack).toBe(1000); // Loser unchanged
  });

  it('should split pot evenly on tie', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000, [
        createCard('A', Suit.Spades),
        createCard('K', Suit.Spades)
      ]),
      createTestPlayer(2, 1000, [
        createCard('A', Suit.Hearts),
        createCard('K', Suit.Hearts)
      ]),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [
        createCard('Q', Suit.Diamonds),
        createCard('J', Suit.Diamonds),
        createCard('10', Suit.Clubs),
        createCard('9', Suit.Clubs),
        createCard('2', Suit.Clubs),
      ],
      pot: 200,
      gamePhase: GamePhase.RIVER,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = endHand(state);

    expect(state.pot).toBe(0);
    expect(state.players[0].stack).toBe(1100); // Each gets half
    expect(state.players[1].stack).toBe(1100);
  });

  it('should handle board plays (everyone has same hand)', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000, [
        createCard('2', Suit.Spades),
        createCard('3', Suit.Spades)
      ]),
      createTestPlayer(2, 1000, [
        createCard('4', Suit.Hearts),
        createCard('5', Suit.Hearts)
      ]),
      createTestPlayer(3, 1000, [
        createCard('6', Suit.Diamonds),
        createCard('7', Suit.Diamonds)
      ]),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [
        createCard('A', Suit.Spades),
        createCard('K', Suit.Spades),
        createCard('Q', Suit.Spades),
        createCard('J', Suit.Spades),
        createCard('10', Suit.Spades),
      ], // Royal flush on board
      pot: 300,
      gamePhase: GamePhase.RIVER,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = endHand(state);

    expect(state.pot).toBe(0);
    // Each player gets 1/3 of pot
    expect(state.players[0].stack).toBe(1100);
    expect(state.players[1].stack).toBe(1100);
    expect(state.players[2].stack).toBe(1100);
  });

  it('should award pot to last player when all others fold', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000),
      createTestPlayer(2, 1000),
      createTestPlayer(3, 1000),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 150,
      gamePhase: GamePhase.PREFLOP,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 100,
        lastRaiserIndex: 0,
        actions: [
          { playerId: 1, action: 'raise', amount: 100 },
        ],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    // Player 2 and 3 fold
    state = fold(state, 2);
    state = fold(state, 3);

    // End hand
    state = endHand(state);

    expect(state.pot).toBe(0);
    expect(state.players[0].stack).toBe(1150); // Winner gets pot
    expect(state.winningHandType).toBeUndefined(); // No showdown
  });
});

describe('Pot Logic - Side Pots', () => {
  
  function createTestPlayer(id: number, stack: number, cards?: [Card, Card]): Player {
    return {
      id,
      name: `Player ${id}`,
      avatarUrl: '',
      stack,
      cards,
      status: PlayerStatus.Active,
      isEliminated: false,
    };
  }

  function createCard(rank: string, suit: Suit): Card {
    return { rank, suit };
  }

  it('should create side pot with one all-in player', () => {
    const players: Player[] = [
      createTestPlayer(1, 0, [
        createCard('A', Suit.Spades),
        createCard('A', Suit.Hearts)
      ]), // All-in for 100
      createTestPlayer(2, 400, [
        createCard('K', Suit.Spades),
        createCard('K', Suit.Hearts)
      ]), // Called 100, has 400 left
      createTestPlayer(3, 400, [
        createCard('Q', Suit.Spades),
        createCard('Q', Suit.Hearts)
      ]), // Called 100, has 400 left
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [
        createCard('2', Suit.Clubs),
        createCard('3', Suit.Clubs),
        createCard('4', Suit.Hearts),
        createCard('7', Suit.Diamonds),
        createCard('9', Suit.Spades),
      ],
      pot: 300, // Main pot: 100 from each player
      gamePhase: GamePhase.RIVER,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [
          { playerId: 1, action: 'raise', amount: 100 },
          { playerId: 2, action: 'call', amount: 100 },
          { playerId: 3, action: 'call', amount: 100 },
        ],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = endHand(state);

    expect(state.pot).toBe(0);
    // Player 1 (AA) wins main pot of 300
    expect(state.players[0].stack).toBe(300);
    // Players 2 and 3 keep their remaining stacks
    expect(state.players[1].stack).toBe(400);
    expect(state.players[2].stack).toBe(400);
  });

  it('should handle all-in player losing', () => {
    const players: Player[] = [
      createTestPlayer(1, 0, [
        createCard('Q', Suit.Spades),
        createCard('Q', Suit.Hearts)
      ]), // All-in for 100, worst hand (already put 100 in pot)
      createTestPlayer(2, 300, [
        createCard('A', Suit.Spades),
        createCard('A', Suit.Hearts)
      ]), // Best hand (already put 100 in pot, 400 - 100 = 300 left)
      createTestPlayer(3, 300, [
        createCard('K', Suit.Spades),
        createCard('K', Suit.Hearts)
      ]), // Second best (already put 100 in pot, 400 - 100 = 300 left)
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [
        createCard('2', Suit.Clubs),
        createCard('3', Suit.Clubs),
        createCard('4', Suit.Hearts),
        createCard('7', Suit.Diamonds),
        createCard('9', Suit.Spades),
      ],
      pot: 300, // 100 from each player
      gamePhase: GamePhase.RIVER,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };
    
    state = endHand(state);

    expect(state.pot).toBe(0);
    // Player 2 (AA) wins entire pot
    expect(state.players[1].stack).toBe(600); // 300 + 300 pot = 600
    // Player 1 (all-in, lost) gets nothing
    expect(state.players[0].stack).toBe(0);
    expect(state.players[0].isEliminated).toBe(true);
  });

  it('should handle multiple all-ins with different stacks (Russian Doll)', () => {
    const players: Player[] = [
      createTestPlayer(1, 0, [
        createCard('A', Suit.Spades),
        createCard('A', Suit.Hearts)
      ]), // All-in for 50, best hand
      createTestPlayer(2, 0, [
        createCard('K', Suit.Spades),
        createCard('K', Suit.Hearts)
      ]), // All-in for 200, second best
      createTestPlayer(3, 800, [
        createCard('Q', Suit.Spades),
        createCard('Q', Suit.Hearts)
      ]), // Called 200, worst hand
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [
        createCard('2', Suit.Clubs),
        createCard('3', Suit.Clubs),
        createCard('4', Suit.Hearts),
        createCard('7', Suit.Diamonds),
        createCard('9', Suit.Spades),
      ],
      pot: 450, // 50 + 200 + 200
      gamePhase: GamePhase.RIVER,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [
          { playerId: 1, action: 'raise', amount: 50 },
          { playerId: 2, action: 'raise', amount: 200 },
          { playerId: 3, action: 'call', amount: 200 },
        ],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    // Expected:
    // Main pot: 150 (50 from each) - Player 1 wins
    // Side pot 1: 300 (150 from P2 and P3) - Player 2 wins
    // Player 1 should get 150
    // Player 2 should get 300
    // Player 3 should keep 800

    state = endHand(state);

    expect(state.pot).toBe(0);
    expect(state.players[0].stack).toBe(150); // Wins main pot
    expect(state.players[1].stack).toBe(300); // Wins side pot
    expect(state.players[2].stack).toBe(800); // Loses both
  });
});

describe('Pot Logic - All-In Scenarios', () => {
  
  function createTestPlayer(id: number, stack: number): Player {
    return {
      id,
      name: `Player ${id}`,
      avatarUrl: '',
      stack,
      status: PlayerStatus.Active,
      isEliminated: false,
    };
  }

  it('should handle player all-in for less than big blind', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000),
      createTestPlayer(2, 25), // Less than BB - will be SB after hand starts
      createTestPlayer(3, 1000),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 0,
      gamePhase: GamePhase.PRE_DEAL,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 2, // Set dealer to 2, so player 0 will be SB (has 1000), player 1 will be BB (has 25)
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = startNewHand(state);

    // After startNewHand, dealer moves from 2 to 0
    // Player at index 1 (ID 2) should be SB (has 25 chips, posts 25, all-in)
    // Player at index 2 (ID 3) should be BB (has 1000 chips, posts 50)
    
    // Find the player who started with 25 chips (player ID 2)
    const shortStackPlayer = state.players.find(p => p.id === 2);
    expect(shortStackPlayer).toBeDefined();
    if (shortStackPlayer) {
      expect(shortStackPlayer.stack).toBe(0); // All chips in pot as SB
    }
  });

  it('should handle all-in that does not reopen betting', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000),
      createTestPlayer(2, 130), // Will go all-in for 130 (less than min-raise)
      createTestPlayer(3, 1000),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 175, // SB + BB
      gamePhase: GamePhase.PREFLOP,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 100,
        lastRaiserIndex: 0,
        actions: [
          { playerId: 1, action: 'raise', amount: 100 },
        ],
      },
      dealerIndex: 2,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    // Player 2 goes all-in for 130 (only 30 more than current bet)
    state = raise(state, 2, 130);

    // This should not reopen betting for Player 1
    // Player 3 should only need to call 130, not be able to raise
    expect(state.bettingState.currentBet).toBe(130);
    expect(state.players[1].stack).toBe(0); // All-in
  });

  it('should handle all-in that equals min-raise (reopens betting)', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000),
      createTestPlayer(2, 200), // Will go all-in for exactly 200 (min-raise)
      createTestPlayer(3, 1000),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 175,
      gamePhase: GamePhase.PREFLOP,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 100,
        lastRaiserIndex: 0,
        actions: [
          { playerId: 1, action: 'raise', amount: 100 },
        ],
      },
      dealerIndex: 2,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    // Player 2 goes all-in for 200 (exactly min-raise)
    state = raise(state, 2, 200);

    // This SHOULD reopen betting for Player 1
    expect(state.bettingState.currentBet).toBe(200);
    expect(state.players[1].stack).toBe(0); // All-in
    expect(state.bettingState.lastRaiserIndex).toBe(1); // Player 2 is last raiser
  });
});

describe('Pot Logic - Chip Conservation', () => {
  
  function createTestPlayer(id: number, stack: number): Player {
    return {
      id,
      name: `Player ${id}`,
      avatarUrl: '',
      stack,
      status: PlayerStatus.Active,
      isEliminated: false,
    };
  }

  it('should never create or destroy chips', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000),
      createTestPlayer(2, 1000),
      createTestPlayer(3, 1000),
    ];

    const totalChipsStart = players.reduce((sum, p) => sum + p.stack, 0);

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 0,
      gamePhase: GamePhase.PRE_DEAL,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    // Start hand
    state = startNewHand(state);

    // Make some bets
    const player1Id = state.players[state.bettingState.currentPlayerIndex].id;
    state = raise(state, player1Id, 150);
    const player2Id = state.players[state.bettingState.currentPlayerIndex].id;
    state = call(state, player2Id);
    const player3Id = state.players[state.bettingState.currentPlayerIndex].id;
    state = call(state, player3Id);

    // End hand
    state = endHand(state);

    const totalChipsEnd = state.players.reduce((sum, p) => sum + p.stack, 0) + state.pot;

    expect(totalChipsEnd).toBe(totalChipsStart);
  });

  it('should maintain chip conservation with side pots', () => {
    const players: Player[] = [
      createTestPlayer(1, 100),
      createTestPlayer(2, 500),
      createTestPlayer(3, 1000),
    ];

    const totalChipsStart = players.reduce((sum, p) => sum + p.stack, 0);

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 0,
      gamePhase: GamePhase.PRE_DEAL,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = startNewHand(state);
    state = endHand(state);

    const totalChipsEnd = state.players.reduce((sum, p) => sum + p.stack, 0) + state.pot;

    expect(totalChipsEnd).toBe(totalChipsStart);
  });
});

describe('Pot Logic - Display and Accuracy', () => {
  
  function createTestPlayer(id: number, stack: number): Player {
    return {
      id,
      name: `Player ${id}`,
      avatarUrl: '',
      stack,
      status: PlayerStatus.Active,
      isEliminated: false,
    };
  }

  it('should accurately track pot size through betting rounds', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000),
      createTestPlayer(2, 1000),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 0,
      gamePhase: GamePhase.PRE_DEAL,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = startNewHand(state);

    // After blinds
    expect(state.pot).toBe(SMALL_BLIND + BIG_BLIND);

    const potAfterBlinds = state.pot;

    // Player raises to 150
    const currentPlayerId = state.players[state.bettingState.currentPlayerIndex].id;
    state = raise(state, currentPlayerId, 150);
    expect(state.pot).toBeGreaterThan(potAfterBlinds);

    // Player calls
    const nextPlayerId = state.players[state.bettingState.currentPlayerIndex].id;
    state = call(state, nextPlayerId);
    
    // Pot should now have: SB (25) + BB (50) + SB adds (125) + BB adds (100) = 300
    // Not 375 because BB already posted 50
    expect(state.pot).toBe(300);
  });

  it('should reset pot to 0 after awarding to winner', () => {
    const players: Player[] = [
      createTestPlayer(1, 1000),
      createTestPlayer(2, 1000),
    ];

    let state: GameState = {
      players,
      deck: shuffleDeck(createDeck()),
      communityCards: [],
      pot: 300,
      gamePhase: GamePhase.RIVER,
      bettingState: {
        currentPlayerIndex: 0,
        currentBet: 0,
        lastRaiserIndex: null,
        actions: [],
      },
      dealerIndex: 0,
      winningHandType: undefined,
      lastWinner: undefined,
      lastWinningHandType: undefined,
    };

    state = endHand(state);

    expect(state.pot).toBe(0);
  });
});

