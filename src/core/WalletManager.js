import { readFileSync, existsSync } from 'fs';
import { ethers } from 'ethers';
import { HttpsProxyAgent } from 'https-proxy-agent';
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
                logger.info('Please create wallets.txt file with your private keys');
                process.exit(1);
            }

            const content = readFileSync('wallets.txt', 'utf-8');
            const lines = content.split('\n').filter(line => line.trim());

            this.wallets = lines.map((line, index) => {
                const trimmed = line.trim();
                let privateKey, name, proxy;

                if (trimmed.includes(':')) {
                    const parts = trimmed.split(':');
                    privateKey = parts[0].trim();
                    name = parts[1]?.trim() || `Wallet-${index + 1}`;
                    
                    // Optional proxy for specific wallet
                    if (parts.length >= 3 && parts[2].trim()) {
                        proxy = parts.slice(2).join(':').trim();
                    }
                } else {
                    privateKey = trimmed;
                    name = `Wallet-${index + 1}`;
                }

                try {
                    const wallet = new ethers.Wallet(privateKey);
                    return { 
                        wallet, 
                        name, 
                        address: wallet.address,
                        proxy: proxy || null 
                    };
                } catch (error) {
                    logger.error(`Invalid private key in line ${index + 1}: ${error.message}`);
                    return null;
                }
            }).filter(wallet => wallet !== null);

            if (this.wallets.length === 0) {
                logger.error('No valid wallets found in wallets.txt!');
                process.exit(1);
            }

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
                } else {
                    logger.warn('No valid proxies found in proxies.txt');
                }
            } else {
                logger.warn('proxies.txt not found, running without proxy');
            }
        } catch (error) {
            logger.warn(`Error loading proxies: ${error.message}, running without proxy`);
        }
        return this.proxies;
    }

    getNextProxy() {
        if (this.proxies.length === 0) return null;
        const proxy = this.proxies[this.currentProxyIndex];
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
        return proxy;
    }

    getProxyAgent(proxy) {
        if (!proxy) return undefined;
        try {
            return new HttpsProxyAgent(`http://${proxy}`);
        } catch (error) {
            logger.warn(`Invalid proxy format: ${proxy}`);
            return undefined;
        }
    }

    getProvider(walletData) {
        const proxy = walletData.proxy || this.getNextProxy();
        
        if (proxy) {
            logger.info(`Using proxy: ${proxy.split('@').pop() || proxy}`);
            const agent = this.getProxyAgent(proxy);
            
            return new ethers.JsonRpcProvider(CONFIG.RPC_URL, {
                chainId: CONFIG.CHAIN_ID,
                name: 'Arc Testnet'
            }, {
                fetchOptions: {
                    agent
                }
            });
        }
        
        return new ethers.JsonRpcProvider(CONFIG.RPC_URL, {
            chainId: CONFIG.CHAIN_ID,
            name: 'Arc Testnet'
        });
    }

    async checkBalance(walletData) {
        try {
            const provider = this.getProvider(walletData);
            const balance = await provider.getBalance(walletData.wallet.address);
            const balanceEth = ethers.formatEther(balance);
            
            return {
                balance: parseFloat(balanceEth),
                balanceFormatted: balanceEth,
                sufficient: parseFloat(balanceEth) >= CONFIG.MIN_BALANCE
            };
        } catch (error) {
            logger.warn(`[${walletData.name}] Could not check balance: ${error.message}`);
            return { 
                balance: 0, 
                balanceFormatted: '0', 
                sufficient: false 
            };
        }
    }

    async checkAllBalances() {
        const balances = [];
        for (const walletData of this.wallets) {
            const balanceInfo = await this.checkBalance(walletData);
            balances.push({
                ...walletData,
                ...balanceInfo
            });
        }
        return balances;
    }

    getWalletCount() {
        return this.wallets.length;
    }

    getWallets() {
        return this.wallets;
    }

    getWalletByIndex(index) {
        return this.wallets[index] || null;
    }

    getWalletByName(name) {
        return this.wallets.find(w => w.name === name) || null;
    }

    validateWalletData() {
        const validWallets = this.wallets.filter(walletData => {
            try {
                // Verify wallet can be used
                const provider = this.getProvider(walletData);
                const connectedWallet = walletData.wallet.connect(provider);
                return connectedWallet.address !== undefined;
            } catch (error) {
                return false;
            }
        });
        
        if (validWallets.length !== this.wallets.length) {
            logger.warn(`Some wallets are invalid. Valid: ${validWallets.length}/${this.wallets.length}`);
        }
        
        return validWallets;
    }
}
