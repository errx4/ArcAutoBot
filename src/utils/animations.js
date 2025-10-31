import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';

export class Animations {
    static async typewriter(text, speed = 50) {
        process.stdout.write(chalk.cyan('┃ '));
        for (let char of text) {
            process.stdout.write(char);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        process.stdout.write('\n');
    }

    static async displayBanner() {
        console.clear();
        
        const bannerBox = boxen(
            chalk.cyan.bold('ARC TESTNET - AUTOMATION BOT') + '\n\n' +
            chalk.yellow('By CryptoLab') + '\n' +
            chalk.blue('https://t.me/cryptolab2x'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan',
                backgroundColor: '#000000'
            }
        );

        console.log(bannerBox);
        
        // Typewriter effect for each line
        await this.typewriter('Initializing ARC Testnet Automation Bot...');
        await this.typewriter('Loading wallet configurations...');
        await this.typewriter('Connecting to blockchain network...');
        console.log('\n');
    }

    static createSpinner(text) {
        return ora({
            text: chalk.blue(text),
            spinner: 'dots',
            color: 'cyan'
        });
    }

    static successBox(message) {
        console.log(boxen(chalk.green('✓ ' + message), {
            padding: 1,
            borderColor: 'green',
            borderStyle: 'round'
        }));
    }

    static errorBox(message) {
        console.log(boxen(chalk.red('✗ ' + message), {
            padding: 1,
            borderColor: 'red',
            borderStyle: 'round'
        }));
    }

    static warningBox(message) {
        console.log(boxen(chalk.yellow('⚠ ' + message), {
            padding: 1,
            borderColor: 'yellow',
            borderStyle: 'round'
        }));
    }
}

export const displayBanner = Animations.displayBanner.bind(Animations);
