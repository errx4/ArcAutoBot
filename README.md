# 🤖 ARC Testnet Automation Bot

<div align="center">

![ARC Bot](https://img.shields.io/badge/ARC-Testnet-blue?style=for-the-badge&logo=ethereum)
![Version](https://img.shields.io/badge/Version-2.1.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Advanced Multi-Wallet Automation Suite for ARC Testnet**

*By CryptoLab - [Telegram Channel](https://t.me/cryptolab2x)*

</div>

## 🚀 Features

### 🎨 **NFT Operations**
- **Batch NFT Minting** - Mint multiple NFTs across multiple wallets
- **Customizable Amounts** - Set different mint amounts per wallet
- **Gas Optimization** - Automatic gas estimation and optimization
- **Real-time Tracking** - Live progress updates and transaction status

### 🪙 **Token Deployment**
- **Custom Token Creation** - Deploy ERC-20 tokens with custom names and symbols
- **Batch Deployment** - Deploy tokens across multiple wallets simultaneously
- **Supply Management** - Custom token supply configuration
- **Validation System** - Automatic token name and symbol validation

### 📝 **Name Registration**
- **Domain Registration** - Register .arc domain names
- **Name Validation** - Automatic name format validation
- **Batch Registration** - Register multiple domains across wallets
- **Random Name Generation** - Automatic unique name generation

### 💧 **Faucet Integration**
- **Manual Faucet Guide** - Step-by-step instructions for getting testnet tokens
- **Balance Checking** - Automatic balance verification
- **Eligibility Check** - Identify wallets that need funding
- **Rate Limit Awareness** - Built-in rate limit information

### 🎯 **Automation Features**
- **AUTO ALL Mode** - Complete automation pipeline (Check + Mint + Deploy + Register)
- **Multi-Wallet Support** - Process hundreds of wallets simultaneously
- **Proxy Support** - Rotating proxy integration for rate limiting
- **Retry Mechanism** - Automatic retry for failed transactions

### 📊 **Analytics & UI**
- **Real-time Statistics** - Live performance metrics and success rates
- **Beautiful Interface** - Color-coded, animated terminal interface
- **Progress Tracking** - Visual progress bars and spinners
- **Transaction History** - Complete transaction logging and tracking

### 🔧 **Technical Features**
- **Error Handling** - Comprehensive error handling and recovery
- **Gas Management** - Automatic gas price optimization
- **Rate Limiting** - Built-in protection against API rate limits
- **Modular Architecture** - Easy to extend and customize

## 📥 Installation

### **1. Termux (Android)**

```bash
# Update packages
pkg update && pkg upgrade

# Install required dependencies
pkg install nodejs git

# Clone the repository
git clone https://github.com/cryptolab/arc-testnet-bot.git
cd arc-testnet-bot

# Install dependencies
npm install

# Create wallet file
echo "YOUR_PRIVATE_KEY_1:Wallet1" > wallets.txt
echo "YOUR_PRIVATE_KEY_2:Wallet2" >> wallets.txt

# Optional: Add proxies
echo "127.0.0.1:8080" > proxies.txt

# Run the bot
npm start
```
### **1. Linux (Ubuntu/Debian)**
```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install git
sudo apt-get install git

# Clone the repository
git clone https://github.com/cryptolab/arc-testnet-bot.git
cd arc-testnet-bot

# Install dependencies
npm install

# Create wallet configuration
nano wallets.txt
# Add your private keys in format: privateKey:walletName

# Optional: Configure proxies
nano proxies.txt
# Add proxies in format: ip:port or ip:port:username:password

# Run the bot
npm start
```
