const { legos } = require("@studydefi/money-legos");
const Arb = artifacts.require("Arb")

module.exports = async function(callback) {
try {
  const usdc = new web3.eth.Contract(legos.erc20.usdc.abi, legos.erc20.usdc.address)
  const usdt = new web3.eth.Contract(legos.erc20.usdc.abi, '0xdAC17F958D2ee523a2206206994597C13D831ec7') //borrow abi from usdc
  const uni = new web3.eth.Contract(legos.uniswapV2.router02.abi, legos.uniswapV2.router02.address)
  const arb = await Arb.deployed()

  const accounts = await web3.eth.getAccounts()
  const path = [legos.erc20.weth.address, legos.erc20.usdc.address]

  const floanFee = '2' //0.000002 USDC

  //get for flash loan fee
  await uni.methods.swapETHForExactTokens(floanFee, path, accounts[0], 2536431400)
  .send({
    gasLimit: 6000000,
    gasPrice: web3.utils.toWei('50', 'Gwei'),
    from: accounts[0],
    value: web3.utils.toWei('1', 'Ether') // Amount of Ether to Swap for USDC
  })

  await usdc.methods.transfer(arb.address, floanFee).send({from: accounts[0]}) //for floan fee

  const userUsdcBalance = await usdc.methods.balanceOf(accounts[0]).call()
  const userUsdtBalance = await usdt.methods.balanceOf(accounts[0]).call()
  const contractUsdcBalance = await usdc.methods.balanceOf(arb.address).call()
  const contractUsdtBalance = await usdt.methods.balanceOf(arb.address).call()

  console.log('user USDC balance after Swap: ', web3.utils.fromWei(userUsdcBalance, 'lovelace'))
  console.log('user USDT balance after Swap: ', web3.utils.fromWei(userUsdtBalance, 'lovelace'))
  console.log('contract USDC balance after Swap: ', web3.utils.fromWei(contractUsdcBalance, 'lovelace'))
  console.log('contract USDT balance after Swap: ', web3.utils.fromWei(contractUsdtBalance, 'lovelace'))

  //Do Arb!
  //const borrowAmount = '405067106448' //~$405k
  const borrowAmount = '450000000000' //~$450k
  const result = await arb.startArb(borrowAmount)

  const userUsdcBalance1 = await usdc.methods.balanceOf(accounts[0]).call()
  const userUsdtBalance1 = await usdt.methods.balanceOf(accounts[0]).call()
  const contractUsdcBalance1 = await usdc.methods.balanceOf(arb.address).call()
  const contractUsdtBalance1 = await usdt.methods.balanceOf(arb.address).call()

  console.log('\nuser USDC balance after Arb: ', web3.utils.fromWei(userUsdcBalance1, 'lovelace'))
  console.log('user USDT balance after Arb: ', web3.utils.fromWei(userUsdtBalance1, 'lovelace'))
  console.log('contract USDC balance after Arb: ', web3.utils.fromWei(contractUsdcBalance1, 'lovelace'))
  console.log('contract USDT balance after Arb: ', web3.utils.fromWei(contractUsdtBalance1, 'lovelace'))
} catch(error) {
  console.log(error)
}
  callback()
}