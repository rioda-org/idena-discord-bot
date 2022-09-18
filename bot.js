require('dotenv').config();
const Discord = require('discord.js');
const functions = require('./functions.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const prefix = ".";
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  
/* part for spoiling invitations, need testing
  {
	  if(functions.validateInvite(message.content)){
		  //invite detected, we need to spoil it
		  let result = await functions.spoilInvite(message.content);
		  if(!result=="undefined")
		  {message.channel.send(await functions.spoiled());}
	  else return;
	  }
	  else
		return;
  }
*/  

  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  try {
    if (command === 'price') {
      let exchange = ((args[0]) ? args[0].toLowerCase() : null);
      message.channel.send(await functions.getIdenaPrice(exchange));
    } else if (command === 'coins') {
      message.channel.send(await functions.getCoins());
    } else if (command === 'rewards') {
      message.channel.send(await functions.getRewards());
    } else if (command === 'invites') {
      message.channel.send(await functions.getInvites());
    } else if (command === 'identities') {
      message.channel.send(await functions.getIdentities());
    } else if (command === 'fix') {
      message.channel.send(await functions.fix());
    } else if (command === 'desktop') {
      message.channel.send(await functions.desktop());
    } else if (command === 'web') {
      message.channel.send(await functions.web());
    } else if (command === 'invite') {
      message.channel.send(await functions.invitation());
    } else if (command === 'help') {
      message.channel.send(await functions.help());
    } else if (command === 'wen') {
      message.channel.send(await functions.wen());
    } else if (command === 'why') {
      message.channel.send(await functions.why());
    } else if (command === 'white') {
      message.channel.send(await functions.white());
    }
  } catch (error) {
    console.log(error);
  }

});