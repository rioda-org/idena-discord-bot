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
        return qtrade_price();
    }
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
            value: qtrade_price.data.data.ask * 100000000 + "/" + qtrade_price.data.data.bid * 100000000 + " Sat",
            inline: true
        }, {
            name: 'High/Low',
            value: qtrade_price.data.data.day_high * 100000000 + "/" + qtrade_price.data.data.day_low * 100000000 + " Sat",
            inline: true
        }, {
            name: 'Volume',
            value: Number(qtrade_price.data.data.day_volume_market).toFixed(3) + " iDNA"

        }, {
            name: 'Buy/Sell Vol',
            value: buy_volume.toFixed(3) + "/" + sell_volume.toFixed(3) + " iDNA"

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
            value: parseFloat(hotbit_depth.data.result.asks[0][0]) * 100000000 + "/" + parseFloat(hotbit_depth.data.result.bids[0][0]) * 100000000 + " Sat",
            inline: true
        }, {
            name: 'High/Low',
            value: parseFloat(hotbit_status.data.result.high) * 100000000 + "/" + parseFloat(hotbit_status.data.result.low) * 100000000 + " Sat",
            inline: true
        }, {
            name: 'Volume',
            value: Number(hotbit_status.data.result.volume).toFixed(3) + " iDNA"

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
            value: vitex.data.data.askPrice * 100000000 + "/" + vitex.data.data.bidPrice * 100000000 + " Sat",
            inline: true
        }, {
            name: 'High/Low',
            value: vitex.data.data.highPrice * 100000000 + "/" + vitex.data.data.lowPrice * 100000000 + " Sat",
            inline: true
        }, {
            name: 'Volume',
            value: Number(vitex.data.data.volume).toFixed(3) + " iDNA"

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
    let onlineidentities = await axios.get('https://api.idena.org/api/onlineidentities/count');
    let onlineminers = await axios.get('https://api.idena.org/api/onlineminers/count');
    let idena_price = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=idena&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true');
    const embed = new Discord.MessageEmbed()
        .setColor(colorize("rewards"))
        .setTitle('Minings rewards')
        .addFields({
            name: 'Mining (day)',
            value: (25920 / onlineminers.data.result).toFixed(3) + " iDNA ~ " + ((25920 / onlineminers.data.result).toFixed(2) * idena_price.data.idena.usd).toFixed(2) + ' usd',
            inline: true
        }, {
            name: 'Mining min. (day)*',
            value: (25920 / onlineidentities.data.result).toFixed(3) + " iDNA ~ " + ((25920 / onlineidentities.data.result).toFixed(2) * idena_price.data.idena.usd).toFixed(2) + ' usd',
            inline: true
        })
        .setFooter("* minimum rewards if every validated identity was online")
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