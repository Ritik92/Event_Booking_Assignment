export interface Event {
    id?: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    timezone: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }