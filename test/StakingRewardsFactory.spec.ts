import chai, { expect } from 'chai'
import { Contract, BigNumber } from 'ethers'
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle'

import { stakingRewardsFactoryFixture } from './fixtures'
import { REWARDS_DURATION } from './utils'

import StakingRewards from '../build/StakingRewards.json'

chai.use(solidity)

describe('StakingRewardsFactory', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  })
  const [wallet, wallet1] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet, wallet1], provider)

  let rewardsToken: Contract
  let rewardAmounts: BigNumber[]
  let stakingRewardsFactory: Contract
  let stakingTokens: Contract[]

  beforeEach('load fixture', async () => {
    const fixture = await loadFixture(stakingRewardsFactoryFixture)
    rewardsToken = fixture.rewardsToken
    rewardAmounts = fixture.rewardAmounts
    stakingRewardsFactory = fixture.stakingRewardsFactory
    stakingTokens = fixture.stakingTokens
  })

  it('deployment gas', async () => {
    const receipt = await provider.getTransactionReceipt(stakingRewardsFactory.deployTransaction.hash)
    expect(receipt.gasUsed).to.eq('2626655')
  })

  describe('#deploy', () => {
    it('pushes the token into the list', async () => {
      await rewardsToken.approve(stakingRewardsFactory.address, 10000)
      await stakingRewardsFactory.deploy(stakingTokens[1].address, 10000, REWARDS_DURATION, rewardsToken.address, 1)
      expect(await stakingRewardsFactory.stakingTokens(0)).to.eq(stakingTokens[1].address)
    })

    it('fails if called twice for same token', async () => {
      await rewardsToken.approve(stakingRewardsFactory.address, 10000)
      await stakingRewardsFactory.deploy(stakingTokens[1].address, 10000, REWARDS_DURATION, rewardsToken.address, 1)
      await expect(stakingRewardsFactory.deploy(stakingTokens[1].address, 10000, REWARDS_DURATION, rewardsToken.address, 1)).to.revertedWith(
        'deploy: already deployed and active'
      )
    })

    it('can only be called by the owner', async () => {
      await rewardsToken.connect(wallet1).approve(stakingRewardsFactory.address, 10000)
      await expect(stakingRewardsFactory.connect(wallet1).deploy(stakingTokens[1].address, 10000, REWARDS_DURATION, rewardsToken.address, 1)).to.be.revertedWith(
        'caller is not the admin'
      )
    })

    it('stores the address of stakingRewards and reward amount', async () => {
      await rewardsToken.approve(stakingRewardsFactory.address, 10000)
      await stakingRewardsFactory.deploy(stakingTokens[1].address, 10000, REWARDS_DURATION, rewardsToken.address, 1)
      const [stakingRewards, rewardAmount] = await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
        stakingTokens[1].address, 1
      )
      expect(await provider.getCode(stakingRewards)).to.not.eq('0x')
      expect(rewardAmount).to.eq(10000)
    })

    it('deployed staking rewards has correct parameters', async () => {
      await rewardsToken.approve(stakingRewardsFactory.address, 10000)
      await stakingRewardsFactory.deploy(stakingTokens[1].address, 10000, REWARDS_DURATION, rewardsToken.address, 1)
      const [stakingRewardsAddress] = await stakingRewardsFactory.stakingRewardsInfoByStakingToken(
        stakingTokens[1].address, 1
      )
      const stakingRewards = new Contract(stakingRewardsAddress, StakingRewards.abi, provider)
      expect(await stakingRewards.rewardsDistribution()).to.eq(stakingRewardsFactory.address)
      expect(await stakingRewards.stakingToken()).to.eq(stakingTokens[1].address)
      expect(await stakingRewards.rewardsToken()).to.eq(rewardsToken.address)
    })
  })
})
