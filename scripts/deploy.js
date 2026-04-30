const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const relayAddress = process.env.RELAY_ADDRESS;

  if (!relayAddress) {
    throw new Error("RELAY_ADDRESS not set in environment");
  }

  console.log("Deploying DappBayActivity...");
  console.log("  Deployer:", deployer.address);
  console.log("  Relay:   ", relayAddress);
  console.log("  Network: ", hre.network.name);

  const Factory = await hre.ethers.getContractFactory("DappBayActivity");
  const contract = await Factory.deploy(relayAddress);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("  Contract:", address);

  // Save deployment record
  const record = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contract: address,
    relay: relayAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "../deployments", `${hre.network.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(record, null, 2));
  console.log("  Saved to deployments/" + hre.network.name + ".json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
