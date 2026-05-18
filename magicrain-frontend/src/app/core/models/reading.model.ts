export interface Reading {
  _id?: string;
  nodeId: string | { _id: string; name: string; zone: string };
  temperature: number;
  humidity: number;
  pressure: number;
  rainfall: boolean;
  condition: 'rain' | 'sun' | 'cold' | 'cloudy' | 'fog';
  timestamp?: string;
  createdBy?: string | { _id: string; name: string; email: string };
}
