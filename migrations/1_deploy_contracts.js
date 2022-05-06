const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");

module.exports = async function (deployer) {
  await deployer.deploy(StakingRewardsFactory);
};
