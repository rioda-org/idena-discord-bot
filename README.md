# idena-price-bot

You can add this bot to your Discord server and use it as a helper bot.
Call bot using commands and it will give you usefull information:

```.price``` - current price of iDNA coin

```.coins``` - details about current supply

```.rewards``` - daily mining rewards estimate

```.invites``` - number of generated and activated invitation codes for current epoch

```.identities``` - number of identites per status

To host it, you need VPS with Ubuntu server 20.04 or simmilar. Bot uses ~60mb of ram.

# Instalation steps:

1. Download files from this repository to some directory on your server

2. Install latest node.js ```curl -fsL bit.ly/node-installer | bash```

3. Navigate to directory where you have downloaded files for bot, something like ```cd idena-price-bot```

4. Install dependencies ```npm install```

5. Install pm2 process manager ```npm i pm2 -g```

6. Start bot ```pm2 start bot.js```

7. Go to Discord developer portal https://discord.com/developers/
- Create application, give it a name and picture
- Go to "Bot", copy a token that is below bot username

8. Back on vps console, edit .env file and put token that you've just copied ```nano .env```

9. Reload bot ```pm2 restart bot --update-env```

10. Back in developer portal, go to "OAuth2"
- check "bot" from SCOPES and below check "Send Messages" and "Read Message History" from BOT PERMISSIONS
- you will get generated URL, visit that URL and it will give you option to include bot to your Discord server

11. Once your bot is in server, give him apropriate role so he can read and send messages.
