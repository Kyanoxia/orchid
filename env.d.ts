declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_ID: string;
            CLIENT_SECRET: string;
        }
    }
}

export{};
