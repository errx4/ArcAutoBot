import { readFileSync, existsSync } from 'fs';
import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';
import { CONFIG } from '../../config/constants.js';

export class WalletManager {
    constructor() {
        this.wallets = [];
        this.proxies = [];
        this.currentProxyIndex = 0;
    }

    loadWallets() {
        try {
            if (!existsSync('wallets.txt')) {
                logger.error('wallets.txt file not found!');
                process.exit(1);
            }

            const content = readFileSync('wallets.txt', 'utf-8');
            const lines = content.split('\n').filter(line => line.trim());

            this.wallets = lines.map((line, index) => {
                const trimmed = line.trim();
                let privateKey, name;

                if (trimmed.includes(':')) {
                    const parts = trimmed.split(':');
                    privateKey = parts[0].trim();
                    name = parts[1]?.trim() || `Wallet-${index + 1}`;
                } else {
                    privateKey = trimmed;
                    name = `Wallet-${index + 1}`;
                }

                try {
                    const wallet = new ethers.Wallet(privateKey);
                    return { wallet, name, address: wallet.address };
                } catch (error) {
                    logger.error(`Invalid private key in line ${index + 1}`);
                    return null;
                }
            }).filter(wallet => wallet !== null);

            logger.success(`Loaded ${this.wallets.length} wallet(s)`);
            return this.wallets;
        } catch (error) {
            logger.error(`Error loading wallets: ${error.message}`);
            process.exit(1);
        }
    }

    loadProxies() {
        try {
            if (existsSync('proxies.txt')) {
                const content = readFileSync('proxies.txt', 'utf-8');
                this.proxies = content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && line.includes(':'));
                
                if (this.proxies.length > 0) {
                    logger.success(`Loaded ${this.proxies.length} proxy(ies)`);
                }
            }
        } catch (error) {
            logger.warn('Could not load proxies, running without proxy');
        }
    }

    getNextProxy() {
        if (this.proxies.length === 0) return null;
        const proxy = this.proxies[this.currentProxyIndex];
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
        return proxy;
    }

    getWalletCount() {
        return this.wallets.length;
    }

    getWallets() {
        return this.wallets;
    }
}
