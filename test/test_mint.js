const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { parseEther } = require('ethers/lib/utils');

describe('Test Mint', function () {

  let contract;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    const P_NFTs = await ethers.getContractFactory('P_NFTs');
    contract = await P_NFTs.deploy();
  });

  it('Test mint by owner', async function () {
    expect(await contract.totalSupply()).to.equal(0);
  });
});