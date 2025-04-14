declare module 'ftp-srv' {
  import { EventEmitter } from 'events';
  
  interface FtpServerOptions {
    url: string;
    pasv_url?: string;
    pasv_min?: number;
    pasv_max?: number;
    anonymous?: boolean;
    greeting?: string;
    log?: any;
    tls?: any;
  }
  
  interface FtpConnection {
    username: string;
    password: string;
  }
  
  interface FtpFile {
    name: string;
    path: string;
    size: number;
  }
  
  interface FtpStorEvent {
    file: FtpFile;
    connection: {
      username: string;
    };
  }
  
  class FtpServer extends EventEmitter {
    constructor(options: FtpServerOptions);
    
    listen(): Promise<void>;
    
    on(event: 'login', listener: (connection: FtpConnection, resolve: Function, reject: Function) => void): this;
    on(event: 'STOR', listener: (data: FtpStorEvent) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: string, listener: Function): this;
  }
  
  export default FtpServer;
}
