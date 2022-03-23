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

  it('Each address can mint up to 2 tokens', async function () {
    await contract.connect(user1).mintPNFT();
    await contract.connect(user1).mintPNFT();
    expect(await contract.totalSupply()).to.equal(2);
    expect(await contract.ownerOf(1)).to.equal(user1.address);
    expect(await contract.ownerOf(2)).to.equal(user1.address);

    await expect(contract.connect(user1).mintPNFT())
      .to.be.revertedWith(Error.EXCEED_QUOTA);

    await contract.connect(user2).mintPNFT();
    expect(await contract.userMintCount(user1.address)).to.equal(2);
    expect(await contract.userMintCount(user2.address)).to.equal(1);
  });
});