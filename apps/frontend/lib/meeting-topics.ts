import { getAppSetting, setAppSetting } from "@/lib/comunicados-db";
import {
  getComunicadoDestinationByKey,
  type ComunicadoDestination,
} from "@/lib/comunicado-destinations";

const MEETING_TOPICS_KEY_PREFIX = "supervisor_meeting_topics";

function sanitizeTopics(topics: string[]) {
  return topics.map((item) => item.trim()).filter(Boolean);
}

function buildStorageKey(destinationKey: string) {
  return `${MEETING_TOPICS_KEY_PREFIX}:${destinationKey}`;
}

export function getMeetingTopicsByDestination(
  destinationKey = "geral",
  fallback?: string[]
) {
  const storedValue = getAppSetting(buildStorageKey(destinationKey));

  if (!storedValue) {
    return sanitizeTopics(fallback ?? []);
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;

    if (!Array.isArray(parsed)) {
      return sanitizeTopics(fallback ?? []);
    }

    return sanitizeTopics(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return sanitizeTopics(fallback ?? []);
  }
}

export function saveMeetingTopicsByDestination(
  destinationKey: string,
  topics: string[]
) {
  const sanitized = sanitizeTopics(topics);
  setAppSetting(buildStorageKey(destinationKey), JSON.stringify(sanitized));
  return sanitized;
}

export function getMeetingTopicsForDestination(
  destination: ComunicadoDestination | null
) {
  if (!destination) {
    return getMeetingTopicsByDestination("geral");
  }

  const generalTopics = getMeetingTopicsByDestination("geral");

  if (destination.key === "geral") {
    return generalTopics;
  }

  const specificTopics = getMeetingTopicsByDestination(destination.key);
  return [...generalTopics, ...specificTopics];
}

export function getMeetingTopicsForSector(areaKey: string | null, sectorKey: string | null) {
  if (!areaKey || !sectorKey) {
    return getMeetingTopicsByDestination("geral");
  }

  const destination = getComunicadoDestinationByKey(`${areaKey}-${sectorKey}`);
  return getMeetingTopicsForDestination(destination);
}
