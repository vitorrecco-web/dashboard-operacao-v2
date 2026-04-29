import { appUsers, type AppUserRecord } from "@/data/users";
import {
  getAreaName,
  getSectorDefinition,
  type AreaKey,
} from "@/lib/sector-config";

export type AuthenticatedUser = {
  role: "admin" | "supervisor";
  username: string;
  displayName: string;
  allowedArea: AreaKey | null;
  allowedSector: string | null;
  areaName: string | null;
  sectorName: string | null;
  homePath: string;
  meetingTopics: string[];
};

function sanitizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function mapUser(user: AppUserRecord): AuthenticatedUser {
  const sector =
    user.allowedArea && user.allowedSector
      ? getSectorDefinition(user.allowedArea, user.allowedSector)
      : null;

  return {
    role: user.role,
    username: sanitizeUsername(user.username),
    displayName: user.displayName,
    allowedArea: user.allowedArea,
    allowedSector: user.allowedSector,
    areaName: user.allowedArea ? getAreaName(user.allowedArea) : null,
    sectorName: sector?.sectorNome ?? null,
    homePath:
      user.role === "admin"
        ? "/admin"
        : user.allowedArea && user.allowedSector
          ? `/area/${user.allowedArea}/${user.allowedSector}`
          : "/",
    meetingTopics: user.meetingTopics,
  };
}

export function authenticateUser(username: string, password: string) {
  const normalizedUsername = sanitizeUsername(username);

  const user = appUsers.find(
    (item) =>
      sanitizeUsername(item.username) === normalizedUsername &&
      item.password === password
  );

  return user ? mapUser(user) : null;
}

export function canAccessArea(
  user: Pick<AuthenticatedUser, "role" | "allowedArea">,
  area: string
) {
  if (user.role === "admin") {
    return true;
  }

  return user.allowedArea === area;
}

export function canAccessSector(
  user: Pick<AuthenticatedUser, "role" | "allowedArea" | "allowedSector">,
  area: string,
  sector: string
) {
  if (user.role === "admin") {
    return true;
  }

  return user.allowedArea === area && user.allowedSector === sector;
}
