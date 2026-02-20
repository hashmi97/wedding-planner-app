export interface Task {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: string;
  status: string;
}

export interface Activity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  quotedPrice?: number | string;
  amountPaid?: number | string;
  nextPaymentDate?: string;
  status?: string;
  notes?: string;
}

export interface Note {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  body?: string;
  tags?: string;
}

