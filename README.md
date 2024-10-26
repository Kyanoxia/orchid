# Skycord
A Discord bot to fetch user accounts from Bluesky

<img src="https://cdn.discordapp.com/banners/1297227452707373267/0a65d009c102d7d65fc3b70004587a1e.webp?size=1024&format=webp&width=1024&height=0" alt="skycord banner" width="100%"/>

## Getting Started
To start, invite the bot to your server using [this URL](https://kyanoxia.com/).  Once it has successfully joined, use the `/connect` command to subscribe to a user!

### Commands
|    **Command Name**   |              **Description**              |             **Usage**           |
| --------------------- | ----------------------------------------- | ------------------------------- |
| `/connect`            | Connect your BlueSky account              | `/connect <username> <message>` |
| `/disconnect`         | Disconnect your BlueSky account           | `/disconnect <username>`        |


## Self-Hosting
Clone this repository:
```
git clone https://github.com/Kyanoxia/bluecord.git
```

Travel into that directory:
```
cd bluecord
```

Install Dependencies:
```
npm i
```

Create your environment variables:
```
touch .env
```

Start the bot:
```
npm run start
```

### Environment Variables
|   **Variable Name**   |              **Description**              |
| --------------------- | -----------------------------------------:|
| `token`               | Your discord bot token                    |
| `discordClientID`     | Your discord bot Client ID                |
| `discordUID`          | Your discord bot User ID                  |
| `mongoURL`            | Your Mongo Database URL                   |
| `devToken`            | Your discord developer mode bot token     |
| `devDiscordClientID`  | Your discord developer mode bot Client ID |
| `devGuildID`          | Your discord dev guild ID                 |
| `devUID`              | JS/TS-style array of developer user IDs   |
| `devMongoURL`         | Your developer mode Mongo database URL    |

If you are unfamiliar with creating environment variables, please refer to [this page](https://www.dotenv.org/docs/security/env).
