const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DappBayActivity", function () {
  let contract, owner, relay, userA, userB;

  beforeEach(async function () {
    [owner, relay, userA, userB] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DappBayActivity");
    contract = await Factory.deploy(relay.address);
    await contract.waitForDeployment();
  });

  // ── Deployment ────────────────────────────────────────────────────────────

  it("sets owner and relay on deploy", async function () {
    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.relay()).to.equal(relay.address);
  });

  it("reverts deploy with zero relay address", async function () {
    const Factory = await ethers.getContractFactory("DappBayActivity");
    await expect(Factory.deploy(ethers.ZeroAddress)).to.be.revertedWith("zero address");
  });

  // ── checkIn ───────────────────────────────────────────────────────────────

  it("emits CheckedIn on first check-in", async function () {
    const today = Math.floor((await time.latest()) / 86400);
    await expect(contract.connect(userA).checkIn())
      .to.emit(contract, "CheckedIn")
      .withArgs(userA.address, today);
  });

  it("records lastActiveDay for the caller", async function () {
    const today = Math.floor((await time.latest()) / 86400);
    await contract.connect(userA).checkIn();
    expect(await contract.lastActiveDay(userA.address)).to.equal(today);
  });

  it("silently no-ops on duplicate check-in same day (no revert, no event)", async function () {
    await contract.connect(userA).checkIn();
    const tx = await contract.connect(userA).checkIn();
    const receipt = await tx.wait();
    expect(receipt.logs.length).to.equal(0);
  });

  it("allows check-in again the next day", async function () {
    await contract.connect(userA).checkIn();
    await time.increase(86400); // advance 1 day
    const tomorrow = Math.floor((await time.latest()) / 86400);
    await expect(contract.connect(userA).checkIn())
      .to.emit(contract, "CheckedIn")
      .withArgs(userA.address, tomorrow);
  });

  it("tracks multiple wallets independently", async function () {
    await contract.connect(userA).checkIn();
    await contract.connect(userB).checkIn();
    const today = Math.floor((await time.latest()) / 86400);
    expect(await contract.lastActiveDay(userA.address)).to.equal(today);
    expect(await contract.lastActiveDay(userB.address)).to.equal(today);
  });

  // ── hasCheckedInToday ─────────────────────────────────────────────────────

  it("returns false before check-in", async function () {
    expect(await contract.hasCheckedInToday(userA.address)).to.equal(false);
  });

  it("returns true after check-in", async function () {
    await contract.connect(userA).checkIn();
    expect(await contract.hasCheckedInToday(userA.address)).to.equal(true);
  });

  it("returns false again the next day", async function () {
    await contract.connect(userA).checkIn();
    await time.increase(86400);
    expect(await contract.hasCheckedInToday(userA.address)).to.equal(false);
  });

  // ── setRelay ──────────────────────────────────────────────────────────────

  it("allows owner to update relay", async function () {
    await contract.connect(owner).setRelay(userA.address);
    expect(await contract.relay()).to.equal(userA.address);
  });

  it("reverts setRelay if called by non-owner", async function () {
    await expect(
      contract.connect(relay).setRelay(userA.address)
    ).to.be.revertedWith("not owner");
  });

  // ── transferOwnership ─────────────────────────────────────────────────────

  it("allows owner to transfer ownership", async function () {
    await contract.connect(owner).transferOwnership(userA.address);
    expect(await contract.owner()).to.equal(userA.address);
  });

  it("reverts transferOwnership if called by non-owner", async function () {
    await expect(
      contract.connect(relay).transferOwnership(userA.address)
    ).to.be.revertedWith("not owner");
  });

  it("reverts transferOwnership to zero address", async function () {
    await expect(
      contract.connect(owner).transferOwnership(ethers.ZeroAddress)
    ).to.be.revertedWith("zero address");
  });

  it("new owner can call setRelay after ownership transfer", async function () {
    await contract.connect(owner).transferOwnership(userA.address);
    await contract.connect(userA).setRelay(userB.address);
    expect(await contract.relay()).to.equal(userB.address);
  });
});
