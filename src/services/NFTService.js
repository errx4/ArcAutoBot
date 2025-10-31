import { TransactionManager } from '../core/TransactionManager.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class NFTService {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.transactionManager = new TransactionManager(walletManager);
    }

    async mintNFT(walletData, amount = 1) {
        const spinner = Animations.createSpinner(`Minting ${amount} NFT(s) for ${walletData.name}...`);
        spinner.start();

        try {
            const result = await this.transactionManager.mintNFT(walletData, amount);
            spinner.stop();

            if (result.success) {
                logger.success(`[${walletData.name}] NFT minted successfully! TX: ${result.hash}`);
                this.stats.successfulTransactions++;
                this.stats.nftsMinted += amount;
                this.stats.totalTransactions++;
                
                return {
                    success: true,
                    hash: result.hash,
                    wallet: walletData.name,
                    amount: amount
                };
            } else {
                logger.error(`[${walletData.name}] NFT mint failed: ${result.error}`);
                this.stats.failedTransactions++;
                this.stats.totalTransactions++;
                
                return {
                    success: false,
                    error: result.error,
                    wallet: walletData.name
                };
            }
        } catch (error) {
            spinner.stop();
            logger.error(`[${walletData.name}] NFT mint error: ${error.message}`);
            this.stats.failedTransactions++;
            this.stats.totalTransactions++;
            
            return {
                success: false,
                error: error.message,
                wallet: walletData.name
            };
        }
    }

    async batchMintNFTs(wallets, amountPerWallet) {
        const results = {
            successful: 0,
            failed: 0,
            transactions: []
        };

        logger.info(`Starting batch NFT mint for ${wallets.length} wallets...`);

        for (let i = 0; i < wallets.length; i++) {
            const walletData = wallets[i];
            
            // Check balance before proceeding
            const balanceCheck = await this.walletManager.checkBalance(walletData);
            if (!balanceCheck.sufficient) {
                logger.warn(`[${walletData.name}] Insufficient balance, skipping...`);
                results.failed++;
                results.transactions.push({
                    wallet: walletData.name,
                    success: false,
                    error: 'Insufficient balance'
                });
                continue;
            }

            const result = await this.mintNFT(walletData, amountPerWallet);
            results.transactions.push(result);

            if (result.success) {
                results.successful++;
            } else {
                results.failed++;
            }

            // Add delay between wallets to avoid rate limiting
            if (i < wallets.length - 1) {
                await this.transactionManager.delay(3000);
            }
        }

        return results;
    }

    getMintStats() {
        return {
            totalMinted: this.stats.nftsMinted,
            successfulTransactions: this.stats.successfulTransactions,
            failedTransactions: this.stats.failedTransactions
        };
    }
}
