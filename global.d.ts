declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            discordClientID: string;
            mongoURL: string;
            devToken: string;
            devDiscordClientID: string;
            devGuildID: string;
            devUID: string[];
            devMongoURL: string;
        }
    }
}
export { };
