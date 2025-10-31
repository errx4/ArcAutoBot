import { readFileSync, existsSync, writeFileSync } from 'fs';
import { ethers } from 'ethers';
import chalk from 'chalk';

export class Helpers {
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static formatAddress(address, startChars = 6, endChars = 4) {
        if (!address || address.length < startChars + endChars) {
            return 'Invalid Address';
        }
        return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
    }

    static formatBalance(balance, decimals = 6) {
        if (typeof balance === 'string') {
            balance = parseFloat(balance);
        }
        return balance.toFixed(decimals);
    }

    static generateRandomName() {
        const prefixes = ['arc', 'test', 'web3', 'crypto', 'defi', 'nft', 'meta', 'chain', 'block', 'token'];
        const suffixes = ['hub', 'world', 'lab', 'zone', 'net', 'dao', 'fi', 'verse', 'link', 'swap'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const randomNum = Math.random().toString(36).substring(2, 6);
        
        return `${prefix}${suffix}${randomNum}`;
    }

    static generateRandomTokenConfig(index = 0) {
        const randomId = Math.random().toString(36).substring(2, 8);
        return {
            name: `Token${randomId}`,
            symbol: `TK${randomId.toUpperCase().substring(0, 4)}`,
            supply: 1000000 + (index * 1000)
        };
    }

    static validatePrivateKey(privateKey) {
        try {
            new ethers.Wallet(privateKey);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    static validateAddress(address) {
        return ethers.isAddress(address);
    }

    static calculateGasCost(gasUsed, gasPrice) {
        if (!gasUsed || !gasPrice) return '0';
        
        const gasUsedBig = BigInt(gasUsed);
        const gasPriceBig = BigInt(gasPrice);
        const costWei = gasUsedBig * gasPriceBig;
        
        return ethers.formatEther(costWei);
    }

    static async retryOperation(operation, maxRetries = 3, delayMs = 2000, operationName = 'Operation') {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw new Error(`${operationName} failed after ${maxRetries} attempts: ${error.message}`);
                }
                
                console.log(chalk.yellow(`⚠️  ${operationName} attempt ${attempt} failed, retrying in ${delayMs/1000}s...`));
                await this.delay(delayMs);
            }
        }
    }

    static parseProxyString(proxyString) {
        if (!proxyString) return null;
        
        const parts = proxyString.split(':');
        if (parts.length === 2) {
            // Format: ip:port
            return { host: parts[0], port: parseInt(parts[1]) };
        } else if (parts.length === 4) {
            // Format: ip:port:username:password
            return {
                host: parts[0],
                port: parseInt(parts[1]),
                auth: {
                    username: parts[2],
                    password: parts[3]
                }
            };
        }
        
        return null;
    }

    static formatProxyForDisplay(proxy) {
        if (!proxy) return 'No proxy';
        
        if (proxy.includes('@')) {
            // Hide credentials in display
            const parts = proxy.split('@');
            return `***@${parts[1]}`;
        }
        return proxy;
    }

    static getCurrentTimestamp() {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    static formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    static calculateSuccessRate(successful, total) {
        if (total === 0) return 0;
        return ((successful / total) * 100).toFixed(2);
    }

    static generateTransactionId() {
        return 'tx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    static validateName(name) {
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

    static saveToFile(filename, data, append = false) {
        try {
            if (append && existsSync(filename)) {
                const existingData = readFileSync(filename, 'utf-8');
                writeFileSync(filename, existingData + '\n' + data);
            } else {
                writeFileSync(filename, data);
            }
            return true;
        } catch (error) {
            console.error(`Error saving to ${filename}:`, error.message);
            return false;
        }
    }

    static readLinesFromFile(filename) {
        try {
            if (!existsSync(filename)) {
                return [];
            }
            const content = readFileSync(filename, 'utf-8');
            return content.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        } catch (error) {
            console.error(`Error reading ${filename}:`, error.message);
            return [];
        }
    }

    static chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    static async confirmAction(message = 'Are you sure you want to continue?') {
        const { confirm } = await import('inquirer').then(module => 
            module.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: chalk.yellow(message),
                    default: false
                }
            ])
        );
        return confirm;
    }
}

// Export utility functions for easy use
export const delay = Helpers.delay.bind(Helpers);
export const formatAddress = Helpers.formatAddress.bind(Helpers);
export const formatBalance = Helpers.formatBalance.bind(Helpers);
export const generateRandomName = Helpers.generateRandomName.bind(Helpers);
export const generateRandomTokenConfig = Helpers.generateRandomTokenConfig.bind(Helpers);
export const retryOperation = Helpers.retryOperation.bind(Helpers);
export const getCurrentTimestamp = Helpers.getCurrentTimestamp.bind(Helpers);
export const formatDuration = Helpers.formatDuration.bind(Helpers);
export const calculateSuccessRate = Helpers.calculateSuccessRate.bind(Helpers);
