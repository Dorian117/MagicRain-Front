export interface Node {
  _id?: string;
  name: string;
  zone: string;
  status: 'active' | 'inactive' | 'fault';
  registeredAt?: string;
  lastReading?: string;
}
