const axios = require('axios');
const Discord = require('discord.js');

function colorize(str) {
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
    return '#' + Array(6 - color.length + 1).join('0') + color;
}

const isLatest24 = (someDate) => {
    const OneDay = new Date().getTime() - (1 * 24 * 60 * 60 * 1000)
    return OneDay < Date.parse(someDate)
}

function numberWithSpaces(x) {
    x = Number(x).toFixed(0);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}


async function price() {
    let price = await axios.get('https://api.dexscreener.com/latest/dex/pairs/bsc/0xaa4dce8585528265c6bac502ca9578343f82630f,0x0039344eb266b027393ac6005e564ad13c450119');
	const embed = new Discord.MessageEmbed()
	.setColor(colorize("price"))
	.setTitle('Price by PancakeSwap')
	.addFields({
		name: 'Price',
		value: '$ ' + price.data.pairs[0].priceUsd,
        inline: true
	}, {
		name: '24h Volume',
		value: '$ ' + (price.data.pairs[0].volume.h24+price.data.pairs[1].volume.h24).toFixed(2),
        inline: true
	}, {
		name: 'Liquidity',
		value: '$ ' + (price.data.pairs[0].liquidity.usd+price.data.pairs[1].liquidity.usd).toFixed(2),
        inline: true
	})
return embed
}


//0xc1bcdc9eb37d8e72ff0e0ca4bc8d19735b1b38ce idna/busd does not work for some reason
//0x0039344eb266b027393ac6005e564ad13c450119 idna/usdt
//0xaa4dce8585528265c6bac502ca9578343f82630f idna/wbnb



exports.getCoins = async function () {
    let coins = await axios.get('http://api.idena.io/api/Coins');
    let circulatingSupply = await axios.get('http://api.idena.io/api/CirculatingSupply');

    const embed = new Discord.MessageEmbed()
        .setColor(colorize("coins"))
        .setTitle('Coins supply')
        .addFields({
            name: 'Total supply',
            value: numberWithSpaces(Number(coins.data.result.totalBalance) + Number(coins.data.result.totalStake)) + " iDNA",
            inline: true
        }, {
            name: 'Circulating supply',
            value: numberWithSpaces(circulatingSupply.data.result) + " iDNA",
            inline: true
        }, {
            name: 'Minted coins',
            value: numberWithSpaces(coins.data.result.minted) + " iDNA",
            inline: true
        }, {
            name: 'Burnt coins',
            value: numberWithSpaces(coins.data.result.burnt) + " iDNA",
            inline: true
        }, {
            name: 'Vested coins',
            value: numberWithSpaces(coins.data.result.totalBalance - circulatingSupply.data.result) + " iDNA",
            inline: true
        }, {
            name: 'Staked coins',
            value: numberWithSpaces(coins.data.result.totalStake) + " iDNA",
            inline: true
        })
    return embed
}


exports.getStaking = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("rewards"))
        .setTitle('Minings rewards')
        .addFields({
            name: "It's complicated",
			value: "Rewards depend on your staked amount.\nCalculate it here:\nhttps://www.idena.io/staking",
            inline: true
        })
    return embed
}

exports.getInvites = async function () {

    let latestEpoch = await axios.get('http://api.idena.io/api/Epoch/Last');
    let invitesSummary = await axios.get(`http://api.idena.io/api/Epoch/${latestEpoch.data.result.epoch}/InvitesSummary`);
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("invites"))
        .setTitle('Invitations')
        .addFields({
            name: 'Issued',
            value: invitesSummary.data.result.allCount,
            inline: true
        }, {
            name: 'Activated',
            value: invitesSummary.data.result.usedCount,
            inline: true
        })
    return embed
}

exports.getIdentities = async function () {
    let latestEpoch = await axios.get('http://api.idena.io/api/Epoch/Last');
    let identities = await axios.get(`http://api.idena.io/api/Epoch/${latestEpoch.data.result.epoch}/IdentityStatesInterimSummary`);
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("identities"))
        .setTitle('Identities')
    identities.data.result.forEach(element => {
        embed.addField(element.value, element.count);
    });
    return embed
}

exports.fix = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("fix"))
        .addFields({
			name: 'Fix Desktop App:',
            value: 'Visit location: %appdata%\\Idena\\node\\datadir\ndelete folders "idenachain.db" and "ipfs"\n\nVisit location: %appdata%\\Idena\ndelete "setting.json"\n\nAnd restart your PC.',
            inline: true
        })
    return embed
}


exports.desktop = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("desktop"))
        .addFields({
			name: 'Desktop App suggestions:',
            value: '- Check your internet connection quality here (http://www.dslreports.com/speedtest). If your connection is graded A or B, you have good connection. If it\'s C or worse, it is bad. If you are connected via Wifi, try connecting using LAN cable and check connection again. If your connection is still bad, you MUST use Web App (https://app.idena.io/) for validation.\n\n- If you are using Windows OS, Install NetTime, program which will keep your clock in perfect syncronisation which is important for validation (http://www.timesynctool.com/NetTimeSetup-314.exe)\n\n- Make sure you turn off any other aplication that uses internet.',
            inline: true
        })
    return embed
}

exports.web = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("web"))
        .addFields({
			name: 'Web App suggestions:',
            value: '\n\nhttps://app.idena.io\n\n- If you are using Windows OS, install NetTime, program which will keep your clock in perfect syncronisation which is important for validation (http://www.timesynctool.com/NetTimeSetup-314.exe)\n\n- Make sure you turn off every other aplication that uses internet\n\n- Do not run Idena Desktop App with node during validation if you have bad internet\n\n- Do not use JavaScript blocking extensions for your browser, Brave browser has built in blockers and will cause problem if you don\'t know how to configure it\n\n- Do not use browser with auto translate option\n\n- Sign in to Web App 6 minutes before validation starts or else you will fail validation with "Late submision" result',
            inline: true
        })
    return embed
}


exports.help = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("help"))
        .setTitle('Bot help')
        .addFields({
			name: 'Commands:',
            value: '`.price` - iDNA price on PancakeSwap\n`.coins` - iDNA coins supply\n`.staking` - gives link for staking rewards calculator\n`.invites` - number of activated invitations\n`.identities` - information about identities\n`.fix` - fix for Desktop App\n`.desktop` - suggestions for using Desktop App\n`.web` - suggestions for using Web App\n`.wen` - remaining time until validation\n`.why` - The answer to a question of all questions\n`.white` - fix for Desktop App white screen problem\n',
            inline: true
        })
    return embed
}


exports.wen = async function () {
    let epochInfo = await axios.get('http://api.idena.io/api/Epoch/Last');
	let validationDate = epochInfo.data.result.validationTime;
	let unixTime = Math.floor(new Date(validationDate).valueOf()/1000);
	const embed = new Discord.MessageEmbed()
        .setColor(colorize("Wen validation?"))
        .addFields({
			name: 'Validation is:',
            value: '<t:'+unixTime+':R> at <t:'+unixTime+':t> ',
            inline: true
        })
    return embed
}


exports.why = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("why"))
        .addFields({
			name: 'Why Idena:',
            value: '- Evolution of the Internet\n- Cryptoidentity\n- No authorities\n- Equal human rights\n- Democratic governance\n- Freedom of speech\n- Universal basic income\n- Attention economy\n- Sharding + Cryptoidentity = Scalability\n- Smart contracts for everyone\n- Instant finality\n- Eco friendly mining',
            inline: true
        })
    return embed
}


exports.white = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("white"))
        .addFields({
			name: 'Why is my Idena App all white?',
            value: 'If your Desktop App worked normal and this happened after sudden computer restart or something:\n\n1. Go here:\nOn Windows `%appdata%\\Idena`\nOn Linux `~/.config/Idena` (go to home directory, press Ctrl+H to show hidden directories)\n\n2. Delete **settings.json** file and Quit and start Idena again\n\nYour file probably got corrupted because of sudden restart. If just deleting settings.json does not help, rename all .json files there and restart Idena App.',
            inline: true
        })
    return embed
}
