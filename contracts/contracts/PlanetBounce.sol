// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, ebool, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PlanetBounce
 * @notice A guessing game where users try to match a randomly selected planet
 * @dev Uses FHE for encrypted comparison - no plaintext leakage
 */
contract PlanetBounce is ZamaEthereumConfig {
    // Planet IDs: 0=Mercury, 1=Venus, 2=Earth, 3=Mars, 4=Jupiter, 5=Saturn, 6=Uranus, 7=Neptune
    uint8 public constant PLANET_COUNT = 8;
    
    // Game state per user
    struct Game {
        euint8 systemChoice;    // System's encrypted planet choice
        euint8 userChoice;      // User's encrypted planet choice
        ebool result;           // Encrypted comparison result
        bool hasPlayed;         // Whether user has submitted their choice
        bool isActive;          // Whether game is active
        uint256 gameId;         // Game round number
    }
    
    mapping(address => Game) private games;
    mapping(address => uint256) public gamesPlayed;
    mapping(address => uint256) public wins;
    
    // Pseudo-random seed for system choice
    uint256 private nonce;
    
    event GameStarted(address indexed player, uint256 gameId);
    event GuessSubmitted(address indexed player, uint256 gameId);
    event GameResult(address indexed player, uint256 gameId);
    
    /**
     * @notice Play a complete round - starts fresh game and submits guess in ONE transaction
     * @param encryptedGuess User's encrypted planet choice
     * @param inputProof Proof for the encrypted input
     */
    function play(
        externalEuint8 encryptedGuess,
        bytes calldata inputProof
    ) external {
        Game storage game = games[msg.sender];
        
        // Auto-end any previous game (always fresh start)
        game.isActive = false;
        
        // Generate pseudo-random planet (0-7)
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            nonce++
        )));
        uint8 systemPlanet = uint8(randomSeed % PLANET_COUNT);
        
        // Encrypt system's choice
        euint8 encryptedSystem = FHE.asEuint8(systemPlanet);
        FHE.allowThis(encryptedSystem);
        
        // Convert user's encrypted input
        euint8 userChoice = FHE.fromExternal(encryptedGuess, inputProof);
        FHE.allowThis(userChoice);
        
        // Compute encrypted comparison: result = (systemChoice == userChoice)
        ebool result = FHE.eq(encryptedSystem, userChoice);
        FHE.allowThis(result);
        
        // Allow user to decrypt the result
        FHE.allow(result, msg.sender);
        
        // Store game state
        game.systemChoice = encryptedSystem;
        game.userChoice = userChoice;
        game.result = result;
        game.hasPlayed = true;
        game.isActive = true;
        game.gameId = gamesPlayed[msg.sender] + 1;
        gamesPlayed[msg.sender]++;
        
        emit GameStarted(msg.sender, game.gameId);
        emit GuessSubmitted(msg.sender, game.gameId);
    }
    
    /**
     * @notice Get result handle for decryption
     * @return The encrypted result handle as bytes32
     */
    function getResultHandle() external view returns (bytes32) {
        Game storage game = games[msg.sender];
        require(game.hasPlayed, "No result yet");
        return FHE.toBytes32(game.result);
    }
}

