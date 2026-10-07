import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  body?: string;
}

export interface ToastOptions {
  duration?: number;
}

const MAX_TOASTS = 4;
const DEFAULT_DURATION = 5000;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((listener) => listener());
}

function clearTimer(id: number) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return toasts;
}

function dismiss(id: number) {
  clearTimer(id);
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function clear() {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
  toasts = [];
  emit();
}

function show(
  variant: ToastVariant,
  title: string,
  body?: string,
  options: ToastOptions = {},
) {

  const duplicate = toasts.find(
    (t) => t.variant === variant && t.title === title && t.body === body,
  );
  if (duplicate) {
    clearTimer(duplicate.id);
    toasts = toasts.filter((t) => t.id !== duplicate.id);
  }

  const id = nextId++;
  toasts = [...toasts, { id, variant, title, body }];

  const overflow = toasts.length - MAX_TOASTS;
  if (overflow > 0) {
    toasts.slice(0, overflow).forEach((t) => clearTimer(t.id));
    toasts = toasts.slice(overflow);
  }

  const duration = options.duration ?? DEFAULT_DURATION;
  if (duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    );
  }

  emit();
  return id;
}

export const toast = {
  success: (title: string, body?: string, options?: ToastOptions) =>
    show("success", title, body, options),
  info: (title: string, body?: string, options?: ToastOptions) =>
    show("info", title, body, options),
  warning: (title: string, body?: string, options?: ToastOptions) =>
    show("warning", title, body, options),
  error: (title: string, body?: string, options?: ToastOptions) =>
    show("error", title, body, options),
  dismiss,
  clear,
};

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
