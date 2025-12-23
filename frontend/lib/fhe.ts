let instance: any = null;
let isInitialized = false;
let isInitializing = false;
let initError: string | null = null;

// Convert Uint8Array to hex string with 0x prefix
function toHex(arr: Uint8Array): `0x${string}` {
  return `0x${Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

export async function initFhevm(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("FHEVM can only be initialized in browser");
  }

  if (instance && isInitialized) return instance;
  if (initError) throw new Error(initError);

  if (isInitializing) {
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (isInitialized && instance) {
          clearInterval(check);
          resolve(instance);
        }
        if (initError) {
          clearInterval(check);
          reject(new Error(initError));
        }
      }, 100);
    });
  }

  isInitializing = true;

  try {
    const { initSDK, createInstance, SepoliaConfig } = await import(
      "@zama-fhe/relayer-sdk/web"
    );
    
    await initSDK({ thread: 0 });
    
    instance = await createInstance({
      ...SepoliaConfig,
      relayerUrl: "/api/relayer",
    });
    
    isInitialized = true;
    return instance;
  } catch (error: any) {
    initError = error.message || "Failed to initialize FHEVM";
    throw error;
  } finally {
    isInitializing = false;
  }
}

export function isFhevmReady(): boolean {
  return isInitialized && instance !== null;
}

export function getFhevmError(): string | null {
  return initError;
}

export function resetFhevm(): void {
  instance = null;
  isInitialized = false;
  isInitializing = false;
  initError = null;
}

export async function encryptPlanetChoice(
  contractAddress: string,
  userAddress: string,
  planetId: number
): Promise<{ handle: `0x${string}`; inputProof: `0x${string}` }> {
  const fhevm = await initFhevm();
  const input = fhevm.createEncryptedInput(contractAddress, userAddress);
  input.add8(BigInt(planetId));

  const encrypted = await input.encrypt();
  return {
    handle: toHex(encrypted.handles[0]),
    inputProof: toHex(encrypted.inputProof),
  };
}

export async function userDecrypt(
  handle: string,
  contractAddress: string,
  signer: any // viem WalletClient
): Promise<boolean> {
  const fhevm = await initFhevm();

  const userAddress = signer.account?.address;
  if (!userAddress) {
    throw new Error("Cannot get user address from signer");
  }

  const { publicKey, privateKey } = fhevm.generateKeypair();
  const eip712 = fhevm.createEIP712(publicKey, [contractAddress]);
  const startTimestamp = eip712.message.startTimestamp ?? Math.floor(Date.now() / 1000);
  const durationDays = eip712.message.durationDays ?? 1;

  const message = {
    ...eip712.message,
    startTimestamp: BigInt(startTimestamp),
    durationDays: BigInt(durationDays),
  };

  const signature = await signer.signTypedData({
    domain: eip712.domain,
    types: eip712.types,
    primaryType: eip712.primaryType,
    message: message,
  });

  const publicKeyStr = publicKey instanceof Uint8Array ? toHex(publicKey) : publicKey;
  const privateKeyStr = privateKey instanceof Uint8Array ? toHex(privateKey) : privateKey;

  const normalizedHandle = handle.startsWith("0x") ? handle : `0x${handle}`;
  const handleContractPairs = [{ handle: normalizedHandle, contractAddress }];

  const results = await fhevm.userDecrypt(
    handleContractPairs,
    privateKeyStr,
    publicKeyStr,
    signature,
    [contractAddress],
    userAddress,
    String(startTimestamp),
    String(durationDays)
  );

  const decryptedValue = results[normalizedHandle] ?? results[handle];
  if (decryptedValue === undefined) {
    throw new Error("No decrypted value found for handle");
  }

  return BigInt(decryptedValue) === 1n;
}
