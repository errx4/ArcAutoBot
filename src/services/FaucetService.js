import { logger } from '../utils/logger.js';
import { Animations } from '../utils/animations.js';
import { CONFIG } from '../../config/constants.js';

export class FaucetService {
    constructor(walletManager, stats) {
        this.walletManager = walletManager;
        this.stats = stats;
    }

    displayFaucetInstructions(address, walletName) {
        console.log(`\n${'═'.repeat(70)}`);
        console.log(`💧 MANUAL FAUCET GUIDE - ARC TESTNET`);
        console.log(`${'═'.repeat(70)}`);
        console.log(`Follow these steps to get free test tokens:\n`);
        console.log(`Wallet: [${walletName}]`);
        console.log(`Address: ${address}\n`);
        console.log(`📋 STEP BY STEP GUIDE:`);
        console.log(`1. Visit: ${CONFIG.FAUCET_WEB_URL}`);
        console.log(`2. Select network: Arc Testnet`);
        console.log(`3. Paste your address in "Send to" field: ${address}`);
        console.log(`4. Click on "Send 10 USDC"`);
        console.log(`5. Wait for confirmation (usually instant)\n`);
        console.log(`⚠️  ATTENTION - RATE LIMIT:`);
        console.log(`If you see "Limit exceeded" message:`);
        console.log(`Message: "Sorry, you've hit the limit. We'll have more test tokens available in 1 hour."`);
        console.log(`Solution: Wait 1 hour and try again\n`);
        console.log(`💡 TIPS:`);
        console.log(`• Limit: 1 request per hour per address`);
        console.log(`• You will receive: 10 USDC + native tokens`);
        console.log(`• Process is free and doesn't require login`);
        console.log(`• Works for Arc Testnet and other networks\n`);
        console.log(`${'═'.repeat(70)}\n`);
    }

    async checkFaucetEligibility(walletData) {
        const spinner = Animations.createSpinner(`Checking faucet eligibility for ${walletData.name}...`);
        spinner.start();

        try {
            const balanceCheck = await this.walletManager.checkBalance(walletData);
            spinner.stop();

            return {
                eligible: !balanceCheck.sufficient,
                currentBalance: balanceCheck.balanceFormatted,
                needsFaucet: !balanceCheck.sufficient,
                wallet: walletData.name,
                address: walletData.wallet.address
            };
        } catch (error) {
            spinner.stop();
            logger.error(`[${walletData.name}] Faucet check failed: ${error.message}`);
            return {
                eligible: false,
                error: error.message,
                wallet: walletData.name
            };
        }
    }

    async processManualFaucet(wallets) {
        const results = {
            guided: 0,
            alreadyFunded: 0,
            wallets: []
        };

        logger.info(`Starting manual faucet guide for ${wallets.length} wallets...`);

        for (let i = 0; i < wallets.length; i++) {
            const walletData = wallets[i];
            
            console.log(`\n${'─'.repeat(70)}`);
            console.log(`Wallet ${i + 1}/${wallets.length}: ${walletData.name}`);
            console.log(`${'─'.repeat(70)}`);

            // Check current balance
            const eligibility = await this.checkFaucetEligibility(walletData);
            
            if (!eligibility.needsFaucet) {
                logger.success(`[${walletData.name}] Already has sufficient balance: ${eligibility.currentBalance} ETH`);
                results.alreadyFunded++;
                results.wallets.push({
                    wallet: walletData.name,
                    status: 'already_funded',
                    balance: eligibility.currentBalance
                });
                continue;
            }

            logger.warn(`[${walletData.name}] Needs faucet. Current balance: ${eligibility.currentBalance} ETH`);
            
            // Display faucet instructions
            this.displayFaucetInstructions(walletData.wallet.address, walletData.name);
            
            results.guided++;
            results.wallets.push({
                wallet: walletData.name,
                status: 'needs_faucet',
                balance: eligibility.currentBalance,
                address: walletData.wallet.address
            });

            // Add pause between wallets
            if (i < wallets.length - 1) {
                logger.info('Moving to next wallet in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        return results;
    }

    async verifyFaucetClaim(walletData) {
        const spinner = Animations.createSpinner(`Verifying faucet claim for ${walletData.name}...`);
        spinner.start();

        try {
            // Wait a bit for transaction to process
            await new Promise(resolve => setTimeout(resolve, 15000));
            
            const balanceCheck = await this.walletManager.checkBalance(walletData);
            spinner.stop();

            const receivedFunds = parseFloat(balanceCheck.balanceFormatted) > CONFIG.MIN_BALANCE;
            
            if (receivedFunds) {
                logger.success(`[${walletData.name}] Faucet claim verified! New balance: ${balanceCheck.balanceFormatted} ETH`);
                this.stats.faucetClaims++;
                return {
                    success: true,
                    newBalance: balanceCheck.balanceFormatted,
                    wallet: walletData.name
                };
            } else {
                logger.warn(`[${walletData.name}] Funds not received yet. Current balance: ${balanceCheck.balanceFormatted} ETH`);
                return {
                    success: false,
                    currentBalance: balanceCheck.balanceFormatted,
                    wallet: walletData.name,
                    message: 'Funds may take a few minutes to arrive'
                };
            }
        } catch (error) {
            spinner.stop();
            logger.error(`[${walletData.name}] Faucet verification failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                wallet: walletData.name
            };
        }
    }

    getFaucetStats() {
        return {
            totalClaims: this.stats.faucetClaims,
            walletsProcessed: this.stats.faucetClaims
        };
    }
}
