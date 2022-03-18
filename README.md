### Sample ERC721

Needs:
* TradeableERC721Token
* Free mint - 1 per wallet, no other requirements
* Capped max supply
* The ability for the control wallet to batch mint to itself
* The ability to pass an array of addresses to batch mint to (this could be 2 separate functions. The list of ~200 addresses will be known beforehand)
* Ability for control wallet to activate/deactivate the ability to mint for the public
* The ability for the control wallet to burn NFTs that it holds
* Ability for control wallet to change the baseURI

```bash
npm install
npx hardhat compile
```