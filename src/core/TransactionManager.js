import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';
import { CONFIG, CONTRACTS, NFT_ABI, NAME_REGISTRY_ABI, TOKEN_BYTECODE } from '../../config/constants.js';

export class TransactionManager {
    constructor(walletManager) {
        this.walletManager = walletManager;
        this.pendingTransactions = new Map();
    }

    async retryOperation(operation, operationName = 'Operation', retries = CONFIG.RETRY_ATTEMPTS) {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                logger.warn(`${operationName} attempt ${i + 1} failed: ${error.message}`);
                
                if (i === retries - 1) {
                    throw error;
                }
                
                logger.info(`Retrying in ${CONFIG.RETRY_DELAY / 1000} seconds...`);
                await this.delay(CONFIG.RETRY_DELAY);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async executeTransaction(walletData, transactionFn, operationName) {
        try {
            const provider = this.walletManager.getProvider(walletData);
            const wallet = walletData.wallet.connect(provider);
            
            logger.transaction(`[${walletData.name}] Executing ${operationName}...`);
            
            const tx = await this.retryOperation(
                () => transactionFn(wallet),
                `${operationName} for ${walletData.name}`
            );
            
            logger.info(`[${walletData.name}] Transaction sent: ${tx.hash}`);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            logger.success(`[${walletData.name}] ${operationName} confirmed!`);
            logger.info(`[${walletData.name}] Gas used: ${receipt.gasUsed.toString()}`);
            
            return {
                success: true,
                hash: tx.hash,
                receipt: receipt,
                gasUsed: receipt.gasUsed.toString()
            };
            
        } catch (error) {
            logger.error(`[${walletData.name}] ${operationName} failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async mintNFT(walletData, amount = 1) {
        return await this.executeTransaction(
            walletData,
            async (wallet) => {
                const nftContract = new ethers.Contract(CONTRACTS.NFT, NFT_ABI, wallet);
                return await nftContract.mint(amount);
            },
            `Mint ${amount} NFT(s)`
        );
    }

    async deployToken(walletData, name, symbol, supply) {
        return await this.executeTransaction(
            walletData,
            async (wallet) => {
                const encodedParams = ethers.AbiCoder.defaultAbiCoder().encode(
                    ['string', 'string', 'uint256'],
                    [name, symbol, ethers.parseEther(supply.toString())]
                );

                const deployData = TOKEN_BYTECODE + encodedParams.slice(2);
                const creationFee = BigInt('0x21a6bbdb5000'); // 0.000037 ETH
                
                logger.info(`Token: ${name} (${symbol}) | Supply: ${supply}`);
                logger.info(`Creation fee: 0.000037 ETH`);
                
                return await wallet.sendTransaction({
                    data: deployData,
                    value: creationFee,
                    gasLimit: 1500000
                });
            },
            `Deploy Token ${name}`
        );
    }

    async registerName(walletData, name) {
        return await this.executeTransaction(
            walletData,
            async (wallet) => {
                const registry = new ethers.Contract(CONTRACTS.NAME_REGISTRY, NAME_REGISTRY_ABI, wallet);
                return await registry.register(
                    name,
                    ethers.ZeroAddress,
                    { value: ethers.parseEther('1') } // 1 ETH for registration
                );
            },
            `Register Name ${name}`
        );
    }

    async sendTransaction(walletData, to, value, data = '0x') {
        return await this.executeTransaction(
            walletData,
            async (wallet) => {
                return await wallet.sendTransaction({
                    to,
                    value: ethers.parseEther(value.toString()),
                    data
                });
            },
            `Send ${value} ETH`
        );
    }

    async getTransactionStatus(hash, walletData) {
        try {
            const provider = this.walletManager.getProvider(walletData);
            const receipt = await provider.getTransactionReceipt(hash);
            
            if (!receipt) {
                return { status: 'pending', confirmations: 0 };
            }
            
            return {
                status: receipt.status === 1 ? 'confirmed' : 'failed',
                confirmations: receipt.confirmations,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            return { status: 'unknown', error: error.message };
        }
    }

    estimateGasCost(transaction) {
        // Simple gas estimation based on operation type
        const gasEstimates = {
            nft_mint: 150000,
            token_deploy: 1200000,
            name_register: 200000,
            eth_transfer: 21000
        };
        
        return gasEstimates[transaction] || 100000;
    }

    validateAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch (error) {
            return false;
        }
    }

    formatAddress(address) {
        if (!this.validateAddress(address)) {
            return 'Invalid Address';
        }
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    async getGasPrice(walletData) {
        try {
            const provider = this.walletManager.getProvider(walletData);
            const feeData = await provider.getFeeData();
            return {
                maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : '0',
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : '0',
                gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0'
            };
        } catch (error) {
            logger.warn(`Could not get gas price: ${error.message}`);
            return { maxFeePerGas: '0', maxPriorityFeePerGas: '0', gasPrice: '0' };
        }
    }
}
