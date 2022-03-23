const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const Error = require('./error');

describe('Test Batch Mint', function () {

  let contract;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const P_NFTs = await ethers.getContractFactory('P_NFTs');
    contract = await P_NFTs.deploy();
    await contract.connect(owner).openMint();
    expect(await contract.totalSupply()).to.equal(0);
    expect(await contract.isOpen()).to.equal(true);
  });

  it('Batch mint for recipients', async function () {
    const recipients = [];
    const cap = await contract.supplyCap();
    for (var i = 0; i < cap; i++) {
      recipients.push(user1.address);
    }
    await contract.connect(owner).batchMint(recipients);
    for (var i = 0; i < cap; i++) {
      expect(await contract.ownerOf(i + 1)).to.equal(user1.address);
    }
    expect(await contract.balanceOf(user1.address)).to.equal(cap);
  });

  it('Batch mint cannot exceed cap', async function () {
    const recipients = [];
    const cap = await contract.supplyCap();
    for (var i = 0; i < cap + 1; i++) {
      recipients.push(user1.address);
    }
    await expect(contract.connect(owner).batchMint(recipients))
      .to.be.revertedWith(Error.EXCEED_CAP);

    expect(await contract.balanceOf(user1.address)).to.equal(0);
    expect(await contract.totalSupply()).to.equal(0);
  });

  it('Batch mint for owner', async function () {
    await contract.connect(owner).batchMintForOwner(3);
    expect(await contract.balanceOf(owner.address)).to.equal(3);
    expect(await contract.totalSupply()).to.equal(3);
  });

  it('Batch mint for owner cannot exceed cap', async function () {
    const cap = await contract.supplyCap();
    await expect(contract.connect(owner).batchMintForOwner(cap + 1))
      .to.be.revertedWith(Error.EXCEED_CAP);
    expect(await contract.balanceOf(owner.address)).to.equal(0);
    expect(await contract.totalSupply()).to.equal(0);
  });

  it('Reject non owner batch mint', async function () {
    const recipients = [];
    const cap = await contract.supplyCap();
    for (var i = 0; i < cap + 1; i++) {
      recipients.push(user1.address);
    }

    await expect(contract.connect(user1).batchMint(recipients))
      .to.be.revertedWith(Error.NOT_OWNER);
  });

  it('Reject non owner batch mint for owner', async function () {
    await expect(contract.connect(user1).batchMintForOwner(3))
      .to.be.revertedWith(Error.NOT_OWNER);
  });


});