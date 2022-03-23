const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const Error = require('./error');

describe('Test Freeze', function () {

  let contract;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const P_NFTs = await ethers.getContractFactory('P_NFTs');
    contract = await P_NFTs.deploy();
    await contract.connect(owner).openMint();
    expect(await contract.totalSupply()).to.equal(0);
    expect(await contract.isOpen()).to.equal(true);

    await contract.connect(owner).mintPNFT();
    await contract.connect(user1).mintPNFT();
    await contract.connect(user2).mintPNFT();
  });

  it('Owner can freeze', async function () {
    await contract.connect(owner).freeze();
    expect(await contract.isFrozen()).to.equal(true);
  });

  it('Non-owner cannot freeze', async function () {
    await expect(contract.connect(user1).freeze())
      .to.be.revertedWith(Error.NOT_OWNER);
    expect(await contract.isFrozen()).to.equal(false);
  });

  it('Cannot set URI while frozen', async function () {
    await contract.connect(owner).freeze();

    const oldURI = await contract.tokenURI(1);

    const newBase = 'ipfs://FOO/';
    await expect(contract.connect(owner).setBaseURI(newBase))
      .to.be.revertedWith(Error.FROZEN);

    const newURI = await contract.tokenURI(1);
    expect(newURI).to.equal(oldURI);
  });

  it('Can transfer while frozen', async function () {
    await contract.connect(owner).freeze();

    await contract.connect(owner).transferFrom(owner.address, user1.address, 1);
    expect(await contract.ownerOf(1)).to.equal(user1.address);
  });
});