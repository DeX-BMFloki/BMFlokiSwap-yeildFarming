const StakingRewardFactory = artifacts.require("StakingRewardFactory");

module.exports = async function (deployer) {
  await deployer.deploy(StakingRewardFactory);
};
