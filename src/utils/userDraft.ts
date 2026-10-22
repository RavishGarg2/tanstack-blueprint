import { storage } from './storage';

export type UserGender = 'male' | 'female';

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyName: string;
  gender: UserGender;
  avatarUrl: string;
}

export interface UserFormDraft {
  step: number;
  values: UserFormValues;
  lastSavedAt: number;
}

export const DRAFT_STORAGE_KEY = 'createUser.formDraft.v1';
export const MAX_DRAFT_STEP = 2;

const FALLBACK_AVATAR = 'https://dummyjson.com/icon/emilys/128';

const asString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const clampStep = (step: unknown): number => {
  if (typeof step !== 'number' || !Number.isFinite(step)) {
    return 0;
  }

  return Math.min(MAX_DRAFT_STEP, Math.max(0, Math.floor(step)));
};

export const hasDraftContent = (values: UserFormValues): boolean =>
  [
    values.firstName,
    values.lastName,
    values.email,
    values.role,
    values.companyName,
  ].some(value => value.trim().length > 0) ||
  values.gender !== 'male' ||
  values.avatarUrl !== FALLBACK_AVATAR;

export const saveDraft = (values: UserFormValues, step: number): void => {
  try {
    const draft: UserFormDraft = {
      step: clampStep(step),
      values: { ...values },
      lastSavedAt: Date.now(),
    };

    storage.set(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Local persistence should never block the profile setup flow.
  }
};

export const loadDraft = (): UserFormDraft | null => {
  try {
    const rawDraft = storage.getString(DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      return null;
    }

    const parsedDraft = JSON.parse(rawDraft) as Partial<UserFormDraft> | null;
    if (!parsedDraft || typeof parsedDraft !== 'object') {
      clearDraft();
      return null;
    }

    const rawValues = (parsedDraft.values ?? {}) as Partial<UserFormValues>;
    const values: UserFormValues = {
      firstName: asString(rawValues.firstName),
      lastName: asString(rawValues.lastName),
      email: asString(rawValues.email),
      role: asString(rawValues.role),
      companyName: asString(rawValues.companyName),
      gender: rawValues.gender === 'female' ? 'female' : 'male',
      avatarUrl: asString(rawValues.avatarUrl) || FALLBACK_AVATAR,
    };
    const step = clampStep(parsedDraft.step);

    if (step === 0 && !hasDraftContent(values)) {
      clearDraft();
      return null;
    }

    return {
      step,
      values,
      lastSavedAt:
        typeof parsedDraft.lastSavedAt === 'number'
          ? parsedDraft.lastSavedAt
          : 0,
    };
  } catch {
    clearDraft();
    return null;
  }
};

export const clearDraft = (): void => {
  try {
    storage.remove(DRAFT_STORAGE_KEY);
  } catch {
    // A failed cleanup should not interrupt navigation.
  }
};

export const formatDraftAge = (timestamp: number): string => {
  if (!timestamp) {
    return 'saved earlier';
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000),
  );

  if (elapsedSeconds < 60) {
    return 'saved just now';
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `saved ${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `saved ${elapsedHours}h ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `saved ${elapsedDays}d ago`;
  }

  return `saved ${new Date(timestamp).toLocaleDateString()}`;
};
