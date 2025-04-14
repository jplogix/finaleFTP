// Configuration interfaces
export interface FtpConfig {
  port: number;
  user: string;
  password: string;
  passivePortStart: number;
  passivePortEnd: number;
}

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface AppConfig {
  uploadDir: string;
  logDir: string;
  healthCheckPort?: number;
}

export interface Config {
  ftp: FtpConfig;
  db: DbConfig;
  app: AppConfig;
}

// Database model interfaces
export interface InventoryItem {
  item_id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  category: string;
  supplier: string;
  cost_price: number;
  selling_price: number;
  raw_data?: any;
}

export interface ImportLog {
  id?: number;
  filename: string;
  status: 'PROCESSING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';
  items_processed?: number;
  items_created?: number;
  items_updated?: number;
  error_message?: string;
  started_at?: Date;
  completed_at?: Date;
}

// Processing result interfaces
export interface ProcessingResult {
  created: number;
  updated: number;
  errors: number;
}

// FTP server interfaces
export interface FtpConnection {
  username: string;
  password: string;
}

export interface FtpFileInfo {
  name: string;
  path: string;
  size: number;
}
