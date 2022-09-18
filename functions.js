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
exports.getIdenaPrice = async function (exchange) {
    if (exchange == "qtrade") {
        return qtrade_price();
    } else if (exchange == "vitex") {
        return vitex_price();
    } else if (exchange == "hotbit") {
        return hotbit_price();
    } else {
        return price();
    }
}



async function price() {
    let price = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=idena&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true');
	const embed = new Discord.MessageEmbed()
	.setColor(colorize("price"))
	.setTitle('Price by CoinGecko')
	.addFields({
		name: 'Price',
		value: '$ ' + price.data.idena.usd,
        inline: true
	}, {
		name: 'Market Cap',
		value: '$ ' + (price.data.idena.usd_market_cap/1000000).toFixed(2) + ' M',
        inline: false
	}, {
		name: '24h Volume',
		value: '$ ' + (price.data.idena.usd_24h_vol/1000).toFixed(0) + ' K',
        inline: true
	}, {
		name: '24h Change',
		value: (price.data.idena.usd_24h_change).toFixed(2) + '%',
        inline: true
	})
return embed
}


async function qtrade_price() {
    let qtrade_price = await axios.get('http://api.qtrade.io/v1/ticker/IDNA_BTC');
    let qtrade_market = await axios.get('https://api.qtrade.io/v1/market/IDNA_BTC/trades');
    let sell_volume = 0;
    let buy_volume = 0;
    if (qtrade_market.data) {
        qtrade_market.data.data.trades.forEach(trade => {
            if (trade.side == 'buy' && isLatest24(trade.created_at)) {
                buy_volume += parseFloat(trade.amount);
            } else if (trade.side == 'sell' && isLatest24(trade.created_at)) {
                sell_volume += parseFloat(trade.amount);
            }
        });
    }
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("qtrade"))
        .setTitle('Qtrade iDNA/BTC')
        .addFields({
            name: 'Ask/Bid',
            value: (qtrade_price.data.data.ask * 100000000).toFixed(0) + "/" + (qtrade_price.data.data.bid * 100000000).toFixed(0) + " Sat",
            inline: true
        }, {
            name: 'High/Low',
            value: (qtrade_price.data.data.day_high * 100000000).toFixed(0) + "/" + (qtrade_price.data.data.day_low * 100000000).toFixed(0) + " Sat",
            inline: true
        }, {
            name: 'Volume',
            value: Number(qtrade_price.data.data.day_volume_market).toFixed(0) + " iDNA"

        }, {
            name: 'Buy/Sell Vol',
            value: buy_volume.toFixed(0) + "/" + sell_volume.toFixed(0) + " iDNA"

        })
    return embed
}


async function hotbit_price() {

    let hotbit_depth = await axios.get('https://api.hotbit.io/api/v1/order.depth?market=IDNA/BTC&limit=100&interval=1e-8');
    let hotbit_summary = await axios.get('https://api.hotbit.io/api/v1/market.summary?markets=[%22IDNA/BTC%22]');
    let hotbit_status = await axios.get('https://api.hotbit.io/api/v1/market.status?market=IDNA/BTC&period=86400');
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("hotbit"))
        .setTitle('Hotbit iDNA/BTC')
        .addFields({
            name: 'Ask/Bid',
            value: (parseFloat(hotbit_depth.data.result.asks[0][0]) * 100000000).toFixed(0) + "/" + (parseFloat(hotbit_depth.data.result.bids[0][0]) * 100000000).toFixed(0) + " Sat",
            inline: true
        }, {
            name: 'High/Low',
            value: (parseFloat(hotbit_status.data.result.high) * 100000000).toFixed(0) + "/" + (parseFloat(hotbit_status.data.result.low) * 100000000).toFixed(0) + " Sat",
            inline: true
        }, {
            name: 'Volume',
            value: Number(hotbit_status.data.result.volume).toFixed(0) + " iDNA"

        })
    return embed
}

async function vitex_price() {
    let vitex = await axios.get('https://api.vitex.net/api/v2/market?symbol=IDNA-000_BTC-000');
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("vitex"))
        .setTitle('ViteX iDNA/BTC')
        .addFields({
            name: 'Ask/Bid',
            value: (vitex.data.data.askPrice * 100000000).toFixed(0) + "/" + (vitex.data.data.bidPrice * 100000000).toFixed(0) + " Sat",
            inline: true
        }, {
            name: 'High/Low',
            value: (vitex.data.data.highPrice * 100000000).toFixed(0) + "/" + (vitex.data.data.lowPrice * 100000000).toFixed(0) + " Sat",
            inline: true
        }, {
            name: 'Volume',
            value: Number(vitex.data.data.volume).toFixed(0) + " iDNA"

        })
    return embed
}

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


exports.getRewards = async function () {
    let onlineidentities = await axios.get('https://api.idena.io/api/onlineidentities/count');
    let onlineminers = await axios.get('https://api.idena.io/api/onlineminers/count');
    let idena_price = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=idena&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true');
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

exports.invitation = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("invitation"))
        .addFields({
			name: 'How to get invitation?',
            value: 'https://medium.com/idena/how-to-get-idena-invitation-easy-and-fast-ec1faace5cc7',
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
            value: '`.price` - iDNA price (qtrade/hotbit/vitex)\n`.coins` - iDNA coins supply\n`.rewards` - daily mining rewards\n`.invites` - number of activated invitations\n`.identities` - information about identities\n`.fix` - fix for Desktop App\n`.desktop` - suggestions for using Desktop App\n`.web` - suggestions for using Web App\n`.invite` - link for article on how to get invitation\n`.wen` - remaining time until validation\n`.why` - The answer to a question of all questions\n`.white` - fix for Desktop App white screen problem\n',
            inline: true
        })
    return embed
}




/*
exports.validateInvite = function (message) {
	return (/^[0-9a-fA-F]{64}$/i.test(message));
}

exports.spoilInvite = function (invite) {
    return axios.post("https://test.idena.site", {"method":"dna_activateInviteToRandAddr","params":[{"key":invite}],"id":1,"key":"test"}).then(response=>response.data.result);
}

exports.spoiled = async function () {
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("spoiled"))
        .addFields({
			name: 'Your invitation has been spoiled and wasted:',
            value: 'Do not share invitation codes publicly. That way we prevent bots from collecting invitation codes.',
            inline: true
        })
    return embed
}
*/

exports.wen = async function () {
    let epochInfo = await axios.get('http://api.idena.io/api/Epoch/Last');
	let validationDate = epochInfo.data.result.validationTime;
	let unixTime = Math.floor(new Date(validationDate).valueOf()/1000);
	const embed = new Discord.MessageEmbed()
        .setColor(colorize("Wen validation?"))
        .addFields({
			name: 'Validation is:',
            value: '<t:'+unixTime+':R> at <t:'+unixTime+':t> ',
			//'<t:'+unixTime+':t> (<t:'+unixTime+':R>)'
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