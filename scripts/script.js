const { legos } = require("@studydefi/money-legos");

module.exports = async function(callback) {
try {
  //Declare contracts
  const USDC = new web3.eth.Contract(legos.erc20.usdc.abi, legos.erc20.usdc.address)
  const USDT = new web3.eth.Contract(legos.erc20.usdc.abi, '0xdac17f958d2ee523a2206206994597c13d831ec7') //abi borrowed from usdc
  const dydx = new web3.eth.Contract(legos.def.abi, legos.dydxFlashloanerAddress)
  const uniswapV2 = new web3.eth.Contract(legos.uniswapV2.router02.abi, legos.uniswapV2.router02.address)
  const curve = new web3.eth.Contract(legos.curvefi.curveAbi, legos.curvefi.yDai_yUsdc_yUsdt_ytUsd.curve.address)

  //Read USDC/ETH price on Uniswap
  const uniUsdcEth = new web3.eth.Contract(legos.uniswapV2.pair.abi, '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc')
  const uniUsdcEthReserves = await uniUsdcEth.methods.getReserves().call()
  const uniUsdcEthPrice = (Number(uniUsdcEthReserves[0]) * 1e12) / Number(uniUsdcEthReserves[1]) //mul. by 1e12 cuz USDC has 6 decimals
  
  console.log('uniUsdcEthPrice', uniUsdcEthPrice)

  //Read USDT/ETH price on Uniswap
  const uniEthUsdt = new web3.eth.Contract(legos.uniswapV2.pair.abi, '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852')
  const uniEthUsdtReserves = await uniEthUsdt.methods.getReserves().call()
  const uniUsdtEthPrice = (Number(uniEthUsdtReserves[1]) / Number(uniEthUsdtReserves[0]) * 1e12) //mul. by 1e12 cuz USDT has 6 decimals
  
  console.log('uniEthUsdtPrice', uniUsdtEthPrice)
  //borrow USDC from dYdX
  await dydx.methods.initiateFlashLoan(
    legos.dydx.soloMargin.address,
    legos.erc20.usdc.address,
    web3.utils.toWei('1', 'ether')
  )
  .send({from: accounts[0], gasLimit: 6000000})
  //swap USDC to WETH on Uni
  //swap WETH to USDT on Uni
  //swap USDT to USDC on Curve
  //repay the loan to dYdX
} catch(error) {
  console.log(error)
}
  callback()
}