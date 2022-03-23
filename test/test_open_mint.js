const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const Error = require('./error');

describe('Test Mint', function () {

  let contract;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const P_NFTs = await ethers.getContractFactory('P_NFTs');
    contract = await P_NFTs.deploy();
    expect(await contract.totalSupply()).to.equal(0);
  });

  it('Owner can open mint', async function () {
    await contract.connect(owner).openMint();
    expect(await contract.isOpen()).to.equal(true);
  });

  it('Non-owner cannot open mint', async function () {
    await expect(contract.connect(user1).openMint())
      .to.be.revertedWith(Error.NOT_OWNER);
    expect(await contract.isOpen()).to.equal(false);
  });

});