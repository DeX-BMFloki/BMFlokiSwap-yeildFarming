import chai from 'chai'
import { Contract, Wallet, BigNumber, providers } from 'ethers'
import { solidity, deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utils'

import UniswapV2ERC20 from '@uniswap/v2-core/build/ERC20.json'
import TestERC20 from '../build/TestERC20.json'
import StakingRewards from '../build/StakingRewards.json'
import StakingRewardsFactory from '../build/StakingRewardsFactory.json'

chai.use(solidity)

const NUMBER_OF_STAKING_TOKENS = 4
const REWARDS_DURATION = 60 * 60 * 24 * 60

interface StakingRewardsFixture {
  stakingRewards: Contract
  rewardsToken: Contract
  stakingToken: Contract
  rewardsDuration: number
}

export async function stakingRewardsFixture([wallet]: Wallet[]): Promise<StakingRewardsFixture> {
  const rewardsDistribution = wallet.address
  const rewardsToken = await deployContract(wallet, TestERC20, [expandTo18Decimals(1000000)])
  const stakingToken = await deployContract(wallet, UniswapV2ERC20, [expandTo18Decimals(1000000)])
  const rewardsDuration = REWARDS_DURATION

  const stakingRewards = await deployContract(wallet, StakingRewards, [
    rewardsDistribution,
    rewardsToken.address,
    stakingToken.address,
    rewardsDuration
  ])

  return { stakingRewards, rewardsToken, stakingToken, rewardsDuration }
}

interface StakingRewardsFactoryFixture {
  rewardsToken: Contract
  stakingTokens: Contract[]
  rewardAmounts: BigNumber[]
  stakingRewardsFactory: Contract
  rewardsDuration: number
}

export async function stakingRewardsFactoryFixture(
  [wallet, wallet1]: Wallet[],
  // provider: providers.Web3Provider
): Promise<StakingRewardsFactoryFixture> {
  const rewardsToken = await deployContract(wallet, TestERC20, [expandTo18Decimals(1_000_000_000)])
  const rewardsDuration = REWARDS_DURATION

  // deploy staking tokens
  const stakingTokens = []
  for (let i = 0; i < NUMBER_OF_STAKING_TOKENS; i++) {
    const stakingToken = await deployContract(wallet, TestERC20, [expandTo18Decimals(1_000_000_000)])
    await stakingToken.mint(wallet1.address, expandTo18Decimals(1_000_000_000))
    stakingTokens.push(stakingToken)
  }

  const rewardAmounts: BigNumber[] = new Array(stakingTokens.length).fill(expandTo18Decimals(10))
  const stakingRewardsFactory = await deployContract(wallet, StakingRewardsFactory)

  return { rewardsToken, stakingTokens, rewardAmounts, stakingRewardsFactory, rewardsDuration }
}
