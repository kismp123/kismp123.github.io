const { ethers } = require('ethers');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Infura/Alchemy RPC URLs
const mainnetRpcUrl = 'https://virginia.rpc.blxrbdn.com';
const sepoliaRpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/2to7iGviKxiX1HIPrA1abBfAaOQuapQQ';

const mainnetProvider = new ethers.JsonRpcProvider(mainnetRpcUrl)
// Set up provider
const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl);

// Load private key from environment variable
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// Contract address and ABI
const contractAddress = process.env.CONTRACT;
const contractAbi = [
    {
        "constant": false,
        "inputs": [
            { "name": "_users", "type": "address[]" },
            { "name": "_privatekeys", "type": "bytes32[]" },
            { "name": "_isUsed", "type": "bool[]" }
        ],
        "name": "newPrivateKeys",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Initialize contract instance
const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

let keys = []
let specialKeys = []
// Function to generate a new random private key and associated address
async function generatePrivateKey() {
    let randomPrivateKey;
    do {
        randomPrivateKey = crypto.randomBytes(32); // 32-byte random private key
    } while (randomPrivateKey[0] <= 0x1f); // Ensure private key is valid
    const randomPrivateKeyHex = ethers.hexlify(randomPrivateKey);

    const randomWallet = new ethers.Wallet(randomPrivateKeyHex)
    // return { privateKey: randomPrivateKey, address: randomWallet.address };
    const initialized = await isInitialized(randomWallet.address)
    if( initialized == true ){
        specialKeys.push({
            privatekey: randomPrivateKeyHex,
            address: randomWallet.address,
            isInitialized: initialized
        })
    }else{
        keys.push({
            privatekey: randomPrivateKeyHex,
            address: randomWallet.address,
            isInitialized: initialized
        })
    }
}

// Function to check if an address is initialized (transaction count > 0)
async function isInitialized(address) {
    const txCount = await mainnetProvider.getTransactionCount(address);
    return txCount > 0;
}

const limitCount=200
let executing = false
let prevGasPrice = null
async function sendTransactionFromStoredKeys() {
    if( executing === true ) return;
    if (specialKeys.length + keys.length < limitCount) {
        console.log("Not enough keys to send transaction.", specialKeys.length + keys.length);
        return;
    }
    executing = true

    let users = []
    let privatekeys = []
    let initialized = []
    let index=0
    for(index=0; index < specialKeys.length && users.length < limitCount; index++){
        users.push(specialKeys[index].address)
        privatekey.push(specialKeys[index].privatekey)
        initialized.push(specialKeys[index].isInitialized)
    }
    specialKeys.splice(0, index)
    for(index=0; index < keys.length && users.length < limitCount; index++){
        users.push(keys[index].address)
        privatekeys.push(keys[index].privatekey)
        initialized.push(keys[index].isInitialized)
    }
    keys.splice(0, index)
    if( prevGasPrice == null ) prevGasPrice = (await provider.getFeeData()).gasPrice
    let result
    try{
        result = await sendTransaction(users, privatekeys, initialized)
    }catch(error){
        if (error.code === 'REPLACEMENT_UNDERPRICED' ) {
            result = null
        }
        console.error("에러 발생:", error);
    }
    if( result != null ) prevGasPrice = prevGasPrice * 70n / 100n
    else prevGasPrice = prevGasPrice * 120n / 100n
    executing = false
}
// Function to send a transaction
async function sendTransaction(users, privateKeys, initialized) {
    const gasPrice = prevGasPrice
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    
    const tx = await contract.newPrivateKeys(users, privateKeys, initialized, {
        gasPrice: gasPrice,
        nonce: nonce
    });

    let result = null
   for(let i=0; i<30; i++){
       result = await waitForTransactionReceipt(tx.hash);
       if( result != null ) break
   }
   return result
}

// Function to wait for a transaction receipt
async function waitForTransactionReceipt(txHash, timeout = 60 * 1, pollInterval = 30) {
    const startTime = Date.now();
    while (true) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval * 1000));

        try {
            const receipt = await provider.getTransactionReceipt(txHash);
            if (receipt) {
                if (receipt.status === 1) {
                    console.log(`Transaction successfully completed. Block Number: ${receipt.blockNumber}`);
                } else {
                    console.log(`Transaction failed. Transaction Hash: ${txHash}`);
                }
                return receipt;
            }
        } catch (err) {
            if (Date.now() - startTime > timeout * 1000) {
                console.log("Timeout reached. Transaction was not included in a block.");
                return null;
            }
            continue;
        }
    }
}

// Main function to loop and send transactions
async function main() {
    await generatePrivateKey();

    // 잠시 대기 (키가 저장된 후 트랜잭션 보내기)
    setTimeout(async () => {
        // 저장된 키로 트랜잭션 보내기
        await sendTransactionFromStoredKeys();
    }, 1000); // 5초 후에 트랜잭션 보내기
}

// Continuously run the main function
async function run() {
    while (true) {
        await main();
    }
}

run().catch(console.error);
