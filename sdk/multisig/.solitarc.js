const { Keypair } = require("@solana/web3.js");
const { readFileSync } = require("fs");
const path = require("path");

const PROGRAM_NAME = "squads_multisig_program";

const programDir = path.join(__dirname, "..", "..", "programs", PROGRAM_NAME);
const idlDir = path.join(__dirname, "idl");
const sdkDir = path.join(__dirname, "src", "generated");
const binaryInstallDir = path.join(__dirname, "..", "..", ".crates");

const ignoredTypes = new Set([
  // Exclude `Permission` enum from the IDL because it is not correctly represented there.
  "Permission",
  // Exclude the types that use `SmallVec` because anchor doesn't have it in the IDL.
  "TransactionMessage",
  "CompiledInstruction",
  "MessageAddressTableLookup",
]);

module.exports = {
  idlGenerator: "anchor",
  programName: PROGRAM_NAME,
  programId: "novatSa4s7wJBHPoCWzyK45Z2N6ky3uYiBEQtw3FjJb",
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
  idlHook: (idl) => {
    return {
      ...idl,
      types: idl.types.filter((type) => {
        return !ignoredTypes.has(type.name);
      }),
    };
  },
};
