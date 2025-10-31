import { TransactionManager } from '../core/TransactionManager.js';
import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';

export class NameService {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
        this.transactionManager = new TransactionManager(walletManager);
    }

    async registerName(walletData, name) {
        const spinner = Animations.createSpinner(`Registering name "${name}" for ${walletData.name}...`);
        spinner.start();

        try {
            const result = await this.transactionManager.registerName(walletData, name);
            spinner.stop();

            if (result.success) {
                logger.success(`[${walletData.name}] Name registered successfully! TX: ${result.hash}`);
                this.stats.successfulTransactions++;
                this.stats.namesRegistered++;
                this.stats.totalTransactions++;
                
                return {
                    success: true,
                    hash: result.hash,
                    wallet: walletData.name,
                    name: name
                };
            } else {
                logger.error(`[${walletData.name}] Name registration failed: ${result.error}`);
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
            logger.error(`[${walletData.name}] Name registration error: ${error.message}`);
            this.stats.failedTransactions++;
            this.stats.totalTransactions++;
            
            return {
                success: false,
                error: error.message,
                wallet: walletData.name
            };
        }
    }

    async batchRegisterNames(wallets, names) {
        const results = {
            successful: 0,
            failed: 0,
            transactions: []
        };

        logger.info(`Starting batch name registration for ${wallets.length} wallets...`);

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

            // Use provided name or generate random one
            const name = names[i] || this.generateRandomName(i);
            
            // Validate name
            const validation = this.validateName(name);
            if (!validation.valid) {
                logger.warn(`[${walletData.name}] Invalid name "${name}": ${validation.error}`);
                results.failed++;
                results.transactions.push({
                    wallet: walletData.name,
                    success: false,
                    error: `Invalid name: ${validation.error}`
                });
                continue;
            }

            const result = await this.registerName(walletData, name);
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

    generateRandomName(index) {
        const prefixes = ['arc', 'test', 'web3', 'crypto', 'defi', 'nft', 'meta', 'chain'];
        const suffixes = ['hub', 'world', 'lab', 'zone', 'net', 'dao', 'fi', 'verse'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const randomNum = Math.random().toString(36).substring(2, 6);
        
        return `${prefix}${suffix}${randomNum}`;
    }

    validateName(name) {
        if (!name || name.length < 3) {
            return { valid: false, error: 'Name must be at least 3 characters long' };
        }
        if (name.length > 20) {
            return { valid: false, error: 'Name must be less than 20 characters' };
        }
        if (!/^[a-z0-9-]+$/.test(name)) {
            return { valid: false, error: 'Name can only contain lowercase letters, numbers, and hyphens' };
        }
        if (name.startsWith('-') || name.endsWith('-')) {
            return { valid: false, error: 'Name cannot start or end with a hyphen' };
        }
        return { valid: true };
    }

    getNameStats() {
        return {
            totalRegistered: this.stats.namesRegistered,
            successfulTransactions: this.stats.successfulTransactions,
            failedTransactions: this.stats.failedTransactions
        };
    }
}
