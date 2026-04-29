import type { AreaKey } from "@/lib/sector-config";

export type AppUserRecord = {
  username: string;
  password: string;
  role: "admin" | "supervisor";
  displayName: string;
  allowedArea: AreaKey | null;
  allowedSector: string | null;
  meetingTopics: string[];
};

export const appUsers: AppUserRecord[] = [
  {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
    role: "admin",
    displayName: "Administrador",
    allowedArea: null,
    allowedSector: null,
    meetingTopics: [],
  },
  {
    username: "picking001",
    password: "picking001",
    role: "supervisor",
    displayName: "Supervisor Picking 001",
    allowedArea: "mercearia",
    allowedSector: "picking",
    meetingTopics: [],
  },
  {
    username: "packing001",
    password: "packing001",
    role: "supervisor",
    displayName: "Supervisor Packing 001",
    allowedArea: "mercearia",
    allowedSector: "packing",
    meetingTopics: [],
  },
  {
    username: "fresh001",
    password: "fresh001",
    role: "supervisor",
    displayName: "Supervisor Fresh 001",
    allowedArea: "fresh",
    allowedSector: "recebimento",
    meetingTopics: [],
  },
];
