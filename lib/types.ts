export type Role = "client" | "tasker";
export type TaskStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type Availability = "available" | "busy" | "unavailable";

export type CategoryDTO = {
  slug: string;
  name: string;
  description: string;
  taskCount: number;
};

export type TaskerDTO = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  bio: string;
  availability: Availability;
  ratingAvg: number;
  ratingCount: number;
  completedTasks: number;
};

export type TaskDTO = {
  id: string;
  clientId: string;
  clientName: string;
  category: string;
  title: string;
  description: string;
  location: string;
  date: string;
  budget: number;
  status: TaskStatus;
  offersCount: number;
  acceptedOfferId: string | null;
  createdAt: string;
};

export type OfferDTO = {
  id: string;
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  taskerId: string;
  taskerName: string;
  price: number;
  estimatedHours: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
};

export type ReviewDTO = {
  id: string;
  taskId: string;
  taskerId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type DashboardDTO = {
  role: Role;
  client: {
    tasks: TaskDTO[];
    offers: OfferDTO[];
    taskCount: number;
    openCount: number;
    spend: number;
  };
  tasker: {
    offers: OfferDTO[];
    earnings: number;
    completedCount: number;
    profile: TaskerDTO | null;
  };
};
