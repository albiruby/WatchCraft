import { create } from "zustand";

import type { Design, DesignElement } from "@/core/schema";
import { TEMPLATES } from "@/core/templates";

const HISTORY_LIMIT = 50;

let lastPush = 0;

type SnapshotState = { design: Design; past: Design[]; future: Design[] };

function snapshot(state: SnapshotState, force = false): Pick<SnapshotState, "past" | "future"> {
  const now = Date.now();
  if (!force && now - lastPush < 600) {
    return { past: state.past, future: state.future };
  }
  lastPush = now;
  return {
    past: [...state.past, state.design].slice(-HISTORY_LIMIT),
    future: [],
  };
}

export type EditorStore = {
  design: Design;
  selectedId: string | null;
  past: Design[];
  future: Design[];
  load: (design: Design) => void;
  select: (id: string | null) => void;
  begin: () => void;
  rename: (name: string) => void;
  setBackground: (color: string) => void;
  update: (id: string, patch: Partial<DesignElement>) => void;
  add: (element: DesignElement) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  nudge: (id: string, dx: number, dy: number) => void;
  reorder: (id: string, direction: "up" | "down") => void;
  toggleVisible: (id: string) => void;
  toggleLocked: (id: string) => void;
  undo: () => void;
  redo: () => void;
};

export const useEditor = create<EditorStore>()((set) => ({
  design: TEMPLATES[0].design,
  selectedId: null,
  past: [],
  future: [],

  load: (design) =>
    set({ design, selectedId: null, past: [], future: [] }),

  select: (selectedId) => set({ selectedId }),

  begin: () => set((state) => snapshot(state, true)),

  rename: (name) =>
    set((state) => ({
      ...snapshot(state),
      design: { ...state.design, name: name.slice(0, 60) },
    })),

  setBackground: (color) =>
    set((state) => ({
      ...snapshot(state),
      design: { ...state.design, background: color },
    })),

  update: (id, patch) =>
    set((state) => ({
      ...snapshot(state),
      design: {
        ...state.design,
        elements: state.design.elements.map((el) =>
          el.id === id ? ({ ...el, ...patch } as DesignElement) : el
        ),
      },
    })),

  add: (element) =>
    set((state) => ({
      ...snapshot(state, true),
      design: {
        ...state.design,
        elements: [...state.design.elements, element],
      },
      selectedId: element.id,
    })),

  remove: (id) =>
    set((state) => ({
      ...snapshot(state, true),
      design: {
        ...state.design,
        elements: state.design.elements.filter((el) => el.id !== id),
      },
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  duplicate: (id) =>
    set((state) => {
      const index = state.design.elements.findIndex((el) => el.id === id);
      if (index < 0) return state;
      const source = state.design.elements[index];
      const copy = {
        ...source,
        id: `${source.id}-${Math.random().toString(36).slice(2, 6)}`,
        x: source.x + 12,
        y: source.y + 12,
        locked: false,
      } as DesignElement;
      const elements = [...state.design.elements];
      elements.splice(index + 1, 0, copy);
      return {
        ...snapshot(state, true),
        design: { ...state.design, elements },
        selectedId: copy.id,
      };
    }),

  nudge: (id, dx, dy) =>
    set((state) => ({
      ...snapshot(state),
      design: {
        ...state.design,
        elements: state.design.elements.map((el) =>
          el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
        ),
      },
    })),

  reorder: (id, direction) =>
    set((state) => {
      const elements = [...state.design.elements];
      const index = elements.findIndex((el) => el.id === id);
      if (index < 0) return state;
      const target = direction === "up" ? index + 1 : index - 1;
      if (target < 0 || target >= elements.length) return state;
      const [item] = elements.splice(index, 1);
      elements.splice(target, 0, item);
      return {
        ...snapshot(state, true),
        design: { ...state.design, elements },
      };
    }),

  toggleVisible: (id) =>
    set((state) => ({
      ...snapshot(state),
      design: {
        ...state.design,
        elements: state.design.elements.map((el) =>
          el.id === id ? { ...el, visible: !el.visible } : el
        ),
      },
    })),

  toggleLocked: (id) =>
    set((state) => ({
      ...snapshot(state),
      design: {
        ...state.design,
        elements: state.design.elements.map((el) =>
          el.id === id ? { ...el, locked: !el.locked } : el
        ),
      },
    })),

  undo: () =>
    set((state) => {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        design: previous,
        past: state.past.slice(0, -1),
        future: [state.design, ...state.future].slice(0, HISTORY_LIMIT),
        selectedId: null,
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return {
        design: next,
        past: [...state.past, state.design].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        selectedId: null,
      };
    }),
}));

export function useSelectedElement(): DesignElement | null {
  return useEditor((state) => {
    if (!state.selectedId) return null;
    return state.design.elements.find((el) => el.id === state.selectedId) ?? null;
  });
}

export function useCanUndo(): boolean {
  return useEditor((state) => state.past.length > 0);
}

export function useCanRedo(): boolean {
  return useEditor((state) => state.future.length > 0);
}
