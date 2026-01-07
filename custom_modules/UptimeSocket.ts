import { WebSocketServer } from "ws";

interface IUptimeServer {
    service: string;
    port: number;
    customOptions: Object;
}

export default class UptimeServer implements IUptimeServer {
    service: string;
    port: number;
    customOptions: Object;

    constructor(service: string, port: number, customOptions: Object) {
        this.service = service;
        this.port = port;
        this.customOptions = customOptions;

        // Start the server
        console.log(`Starting uptime server (port: ${port})`);
        const uptimeServer = new WebSocketServer({ port: port });
        uptimeServer.on('connection', function connection(ws) {
          ws.on('error', console.error);
        
          ws.on('message', function message(data) {
            console.log('received: %s', data);
          });
        
            setInterval(() => {
                ws.send(JSON.stringify({
                    service: service,
                    requestTime: new Date().toISOString(),
                    customOptions
                }));
            }, 1000);
        });
    }
}
