const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DappBayActivity", function () {
  let contract, owner, relay, other;

  beforeEach(async function () {
    [owner, relay, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DappBayActivity");
    contract = await Factory.deploy(relay.address);
    await contract.waitForDeployment();
  });

  it("sets owner and relay on deploy", async function () {
    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.relay()).to.equal(relay.address);
  });

  it("emits ActivityRecorded for each wallet", async function () {
    const wallets = [other.address, owner.address];
    const date = 20260409;

    const tx = await contract.connect(relay).recordBatchActivity(wallets, date);
    await expect(tx)
      .to.emit(contract, "ActivityRecorded")
      .withArgs(other.address, date);
    await expect(tx)
      .to.emit(contract, "ActivityRecorded")
      .withArgs(owner.address, date);
  });

  it("reverts if called by non-relay", async function () {
    await expect(
      contract.connect(other).recordBatchActivity([other.address], 20260409)
    ).to.be.revertedWith("not relay");
  });

  it("allows owner to update relay", async function () {
    await contract.connect(owner).setRelay(other.address);
    expect(await contract.relay()).to.equal(other.address);
  });

  it("reverts setRelay if called by non-owner", async function () {
    await expect(
      contract.connect(relay).setRelay(other.address)
    ).to.be.revertedWith("not owner");
  });

  it("allows owner to transfer ownership", async function () {
    await contract.connect(owner).transferOwnership(other.address);
    expect(await contract.owner()).to.equal(other.address);
  });

  it("reverts transferOwnership if called by non-owner", async function () {
    await expect(
      contract.connect(relay).transferOwnership(other.address)
    ).to.be.revertedWith("not owner");
  });

  it("reverts transferOwnership to zero address", async function () {
    await expect(
      contract.connect(owner).transferOwnership(ethers.ZeroAddress)
    ).to.be.revertedWith("zero address");
  });

  it("new owner can call setRelay after ownership transfer", async function () {
    await contract.connect(owner).transferOwnership(other.address);
    await contract.connect(other).setRelay(relay.address);
    expect(await contract.relay()).to.equal(relay.address);
  });
});
