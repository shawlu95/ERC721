const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const Error = require('./error');

describe.only('Test Mint', function () {

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

  it('Owner can change base URL', async function () {
    await contract.connect(user1).mintPNFT();
    expect(await contract.totalSupply()).to.equal(1);

    const oldURI = await contract.tokenURI(1);

    const newBase = 'ipfs://FOO/';
    await contract.connect(owner).setBaseURI(newBase);

    const newURI = await contract.tokenURI(1);
    expect(newURI).to.equal('ipfs://FOO/1');
    expect(newURI).to.not.equal(oldURI);
  });

  it('Non owner cannot change base URL', async function () {
    await contract.connect(user1).mintPNFT();
    expect(await contract.totalSupply()).to.equal(1);

    const newBase = 'ipfs://FOO/';
    await expect(contract.connect(user1).setBaseURI(newBase))
      .to.be.revertedWith(Error.NOT_OWNER);
  });

});