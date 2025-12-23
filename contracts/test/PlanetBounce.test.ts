import { expect } from "chai";
import { ethers } from "hardhat";
import { PlanetBounce } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * PlanetBounce Contract Tests
 * 
 * Note: Full FHE encryption tests require Zama's coprocessor (Sepolia testnet).
 * These tests cover contract structure, deployment, and basic functionality.
 * For integration tests with actual FHE operations, deploy to Sepolia.
 */
describe("PlanetBounce", function () {
  let planetBounce: PlanetBounce;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const PlanetBounceFactory = await ethers.getContractFactory("PlanetBounce");
    planetBounce = await PlanetBounceFactory.deploy();
    await planetBounce.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const address = await planetBounce.getAddress();
      expect(address).to.be.properAddress;
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("should have correct PLANET_COUNT constant", async function () {
      const planetCount = await planetBounce.PLANET_COUNT();
      expect(planetCount).to.equal(8);
    });
  });

  describe("Initial State", function () {
    it("should start with zero games played for new player", async function () {
      const gamesPlayed = await planetBounce.gamesPlayed(player1.address);
      expect(gamesPlayed).to.equal(0);
    });

    it("should start with zero wins for new player", async function () {
      const wins = await planetBounce.wins(player1.address);
      expect(wins).to.equal(0);
    });

    it("should revert getResultHandle when no game played", async function () {
      await expect(
        planetBounce.connect(player1).getResultHandle()
      ).to.be.revertedWith("No result yet");
    });
  });

  describe("Game State Isolation", function () {
    it("should track games separately for different players", async function () {
      const player1Games = await planetBounce.gamesPlayed(player1.address);
      const player2Games = await planetBounce.gamesPlayed(player2.address);
      
      expect(player1Games).to.equal(0);
      expect(player2Games).to.equal(0);
    });

    it("should have independent win counters per player", async function () {
      const player1Wins = await planetBounce.wins(player1.address);
      const player2Wins = await planetBounce.wins(player2.address);
      
      expect(player1Wins).to.equal(0);
      expect(player2Wins).to.equal(0);
    });
  });

  describe("Contract Interface", function () {
    it("should expose play function with correct signature", async function () {
      const fragment = planetBounce.interface.getFunction("play");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(2);
      expect(fragment?.inputs[0].type).to.equal("bytes32");
      expect(fragment?.inputs[1].type).to.equal("bytes");
    });

    it("should expose getResultHandle function", async function () {
      const fragment = planetBounce.interface.getFunction("getResultHandle");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(0);
      expect(fragment?.outputs?.length).to.equal(1);
      expect(fragment?.outputs?.[0].type).to.equal("bytes32");
    });

    it("should expose gamesPlayed mapping", async function () {
      const fragment = planetBounce.interface.getFunction("gamesPlayed");
      expect(fragment).to.not.be.null;
    });

    it("should expose wins mapping", async function () {
      const fragment = planetBounce.interface.getFunction("wins");
      expect(fragment).to.not.be.null;
    });

    it("should expose PLANET_COUNT constant", async function () {
      const fragment = planetBounce.interface.getFunction("PLANET_COUNT");
      expect(fragment).to.not.be.null;
    });
  });

  describe("Events", function () {
    it("should define GameStarted event", async function () {
      const event = planetBounce.interface.getEvent("GameStarted");
      expect(event).to.not.be.null;
      expect(event?.inputs.length).to.equal(2);
      expect(event?.inputs[0].name).to.equal("player");
      expect(event?.inputs[1].name).to.equal("gameId");
    });

    it("should define GuessSubmitted event", async function () {
      const event = planetBounce.interface.getEvent("GuessSubmitted");
      expect(event).to.not.be.null;
      expect(event?.inputs.length).to.equal(2);
    });

    it("should define GameResult event", async function () {
      const event = planetBounce.interface.getEvent("GameResult");
      expect(event).to.not.be.null;
    });
  });

  describe("Security", function () {
    it("should not expose private games mapping directly", async function () {
      // games mapping is private - can only access via getResultHandle
      // This test ensures the contract doesn't have a public games() getter
      const fragment = planetBounce.interface.getFunction("games");
      expect(fragment).to.be.null;
    });

    it("should require game to be played before getting result", async function () {
      await expect(
        planetBounce.connect(player1).getResultHandle()
      ).to.be.revertedWith("No result yet");
    });
  });
});

/**
 * Integration Test Notes (for Sepolia):
 * 
 * To test actual FHE functionality, deploy to Sepolia and run:
 * 
 * 1. Initialize FHEVM SDK in test environment
 * 2. Create encrypted input using fhevm.createEncryptedInput()
 * 3. Call play() with encrypted guess and proof
 * 4. Verify gamesPlayed incremented
 * 5. Get result handle via getResultHandle()
 * 6. Decrypt result using userDecrypt with EIP-712 signature
 * 
 * Example (pseudo-code):
 * 
 * const fhevm = await initFhevm();
 * const input = fhevm.createEncryptedInput(contractAddress, playerAddress);
 * input.add8(BigInt(3)); // Choose Mars (id=3)
 * const encrypted = await input.encrypt();
 * 
 * await planetBounce.connect(player).play(encrypted.handle, encrypted.inputProof);
 * 
 * const handle = await planetBounce.connect(player).getResultHandle();
 * const isMatch = await userDecrypt(handle, contractAddress, playerSigner);
 */

