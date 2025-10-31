import { TransactionManager } from '../core/TransactionManager.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class TokenService {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.transactionManager = new TransactionManager(walletManager);
    }

    async deployToken(walletData, name, symbol, supply) {
        const spinner = Animations.createSpinner(`Deploying token ${name} for ${walletData.name}...`);
        spinner.start();

        try {
            const result = await this.transactionManager.deployToken(walletData, name, symbol, supply);
            spinner.stop();

            if (result.success) {
                logger.success(`[${walletData.name}] Token deployed successfully! TX: ${result.hash}`);
                this.stats.successfulTransactions++;
                this.stats.tokensDeployed++;
                this.stats.totalTransactions++;
                
                return {
                    success: true,
                    hash: result.hash,
                    wallet: walletData.name,
                    tokenName: name,
                    tokenSymbol: symbol,
                    supply: supply
                };
            } else {
                logger.error(`[${walletData.name}] Token deployment failed: ${result.error}`);
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
            logger.error(`[${walletData.name}] Token deployment error: ${error.message}`);
            this.stats.failedTransactions++;
            this.stats.totalTransactions++;
            
            return {
                success: false,
                error: error.message,
                wallet: walletData.name
            };
        }
    }

    async batchDeployTokens(wallets, tokenConfigs) {
        const results = {
            successful: 0,
            failed: 0,
            transactions: []
        };

        logger.info(`Starting batch token deployment for ${wallets.length} wallets...`);

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

            // Use provided config or generate random one
            const config = tokenConfigs[i] || this.generateRandomTokenConfig(i);
            
            const result = await this.deployToken(
                walletData, 
                config.name, 
                config.symbol, 
                config.supply
            );
            
            results.transactions.push(result);

            if (result.success) {
                results.successful++;
            } else {
                results.failed++;
            }

            // Add delay between wallets
            if (i < wallets.length - 1) {
                await this.transactionManager.delay(3000);
            }
        }

        return results;
    }

    generateRandomTokenConfig(index) {
        const randomId = Math.random().toString(36).substring(2, 8);
        return {
            name: `TestToken${randomId}`,
            symbol: `TT${randomId.toUpperCase().substring(0, 4)}`,
            supply: 1000000 + (index * 1000)
        };
    }

    validateTokenName(name) {
        if (!name || name.length < 2) {
            return { valid: false, error: 'Token name must be at least 2 characters long' };
        }
        if (name.length > 30) {
            return { valid: false, error: 'Token name must be less than 30 characters' };
        }
        return { valid: true };
    }

    validateTokenSymbol(symbol) {
        if (!symbol || symbol.length < 2) {
            return { valid: false, error: 'Token symbol must be at least 2 characters long' };
        }
        if (symbol.length > 10) {
            return { valid: false, error: 'Token symbol must be less than 10 characters' };
        }
        if (!/^[A-Za-z0-9]+$/.test(symbol)) {
            return { valid: false, error: 'Token symbol can only contain letters and numbers' };
        }
        return { valid: true };
    }

    getDeploymentStats() {
        return {
            totalDeployed: this.stats.tokensDeployed,
            successfulTransactions: this.stats.successfulTransactions,
            failedTransactions: this.stats.failedTransactions
        };
    }
}
