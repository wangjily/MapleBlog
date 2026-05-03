import type { GenericEntry } from "@/types";

// Sort by date
export const sortByDate = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort(
    (a: any, b: any) =>
      new Date(b.data.createdAt && b.data.createdAt).valueOf() -
      new Date(a.data.createdAt && a.data.createdAt).valueOf(),
  );
  return sortedEntries;
};

//sort by update
export const sortByUpdate = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort(
    (a: any, b: any) =>
      new Date(b.data.updatedAt && b.data.updatedAt).valueOf() -
      new Date(a.data.updatedAt && a.data.updatedAt).valueOf(),
  );
  return sortedEntries;
};

// Sort by title
export const sortByTitle = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort((a: any, b: any) =>
    a.data.title.localeCompare(b.data.title),
  );
  return sortedEntries;
};

// Sort by random
export const sortByRandom = (entries: GenericEntry[]): GenericEntry[] => {
  const sortedEntries = entries.sort(() => Math.random() - 0.5);
  return sortedEntries;
};
