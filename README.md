# Orchid
Gracefully connect your Bluesky account to any Discord channel

<sup>currently limited to non-nsfw until May 1 2025</sup>

<img src="https://github.com/Kyanoxia/skycord/blob/main/assets/SocialHero.png" alt="orchid banner" width="100%"/>

<p align="center">
  <a href='https://ko-fi.com/kyanoxia'><img src='https://img.shields.io/badge/Buy%20Me%20a%20Coffee!-whitesmoke?style=for-the-badge&logo=kofi&logoColor=whitesmoke&labelColor=dimgray&color=dimgray' alt='Buy Me a Coffee at ko-fi.com' /></a>
  <a href='https://github.com/sponsors/kyanoxia'><img src='https://img.shields.io/github/sponsors/kyanoxia?style=for-the-badge&logo=githubsponsors&logoColor=hotpink&label=Sponsor%20me!&labelColor=dimgray&color=dimgray' /></a>
</p>

## Getting Started
To start, please invite the bot to your server using [this URL](https://discord.com/oauth2/authorize?client_id=1297227452707373267).  Once it has successfully joined, use the `/connect` command to subscribe to a user!

### Commands
**`<>` indicates required, `[]` indicates optional**
|    **Command Name**   |               **Description**               |                             **Usage**                              |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `/botinfo`            | (global) Display information about Skycord  | `/botinfo`                                                         |
| `/connect`            | Connect your BlueSky account                | `/connect <handle> [embed provider] [replies] [message] [regex]`   |
| `/disconnect`         | Disconnect your BlueSky account             | `/disconnect <handle>`                                             |
| `/help`               | Display help page                           | `/help`                                                            |
| `/info`               | Display information about a command         | `/info <subcommand>`                                               |
| `/list`               | Display subscribed users in channel         | `/list`                                                            |

## Self-Hosting
### Prerequisites
NodeJS (v18.19.0+) & NPM must be installed.  Once installed, please globally install typescript for convenience:
```
npm i --global typescript
```
Now that that's out of the way, let's get to it.

### Setting Up

Clone this repository:
```
git clone https://github.com/Kyanoxia/orchid.git
```

Travel into that directory:
```
cd orchid
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
npm run dev
```
or for production (using pm2 for process persistence)
```
npm run startpm
```

### Environment Variables
|   **Variable Name**   |                **Description**              |
| --------------------- | -------------------------------------------:|
| `token`               | Your discord bot token                      |
| `discordClientID`     | Your discord bot Client ID                  |
| `mongoURL`            | Your Mongo Database URL                     |
| `devGuildID`          | Discord developer guild ID for dev commands |
| `devUID`              | JS/TS-style array of developer user IDs     |

If you are unfamiliar with creating environment variables, please refer to [this page](https://www.dotenv.org/docs/security/env).

### Commands for developers
**`<>` indicates required, `[]` indicates optional**
|    **Command Name**   |               **Description**               |            **Usage**         |
| --------------------- | ------------------------------------------- | ---------------------------- |
| `/emit`               | Artificially trigger join/leave event       | `/emit <event>`              |
| `/getdatabase`        | Print the whole database to console         | `/getdatabase`               |
