const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const Error = require('./error');

describe('Test Quota', function () {

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

  it('Owner can pause & unpause', async function () {
    await contract.connect(owner).pause();
    expect(await contract.paused()).to.equal(true);

    await contract.connect(owner).unpause();
    expect(await contract.paused()).to.equal(false);
  });

  it('Non-owner cannot pause & unpause', async function () {
    await expect(contract.connect(user1).pause())
      .to.be.revertedWith(Error.NOT_OWNER);
    expect(await contract.paused()).to.equal(false);

    await contract.connect(owner).pause();
    expect(await contract.paused()).to.equal(true);

    await expect(contract.connect(user1).unpause())
      .to.be.revertedWith(Error.NOT_OWNER);
    expect(await contract.paused()).to.equal(true);
  });

  it('Cannot mint while paused', async function () {
    await contract.connect(owner).pause();

    await expect(contract.connect(user1).mintPNFT())
      .to.be.revertedWith(Error.PAUSED);
    expect(await contract.totalSupply()).to.equal(0);

    await contract.connect(owner).unpause();
    await contract.connect(user1).mintPNFT();
    expect(await contract.totalSupply()).to.equal(1);
  });

  it('Cannot burn while paused', async function () {
    await contract.connect(owner).mintPNFT();
    expect(await contract.totalSupply()).to.equal(1);

    await contract.connect(owner).pause();
    await expect(contract.connect(owner).burn(1))
      .to.be.revertedWith(Error.PAUSED_TRANSFER);
    expect(await contract.totalSupply()).to.equal(1);

    await contract.connect(owner).unpause();
    await contract.connect(owner).burn(1)
    expect(await contract.totalSupply()).to.equal(0);
  });

  it('Cannot transfer while paused', async function () {
    await contract.connect(owner).mintPNFT();
    expect(await contract.totalSupply()).to.equal(1);

    await contract.connect(owner).pause();
    await expect(contract.connect(owner).transferFrom(owner.address, user1.address, 1))
      .to.be.revertedWith(Error.PAUSED_TRANSFER);
    expect(await contract.ownerOf(1)).to.equal(owner.address);

    await contract.connect(owner).unpause();
    await contract.connect(owner).transferFrom(owner.address, user1.address, 1);
    expect(await contract.ownerOf(1)).to.equal(user1.address);
  });
});