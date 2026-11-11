import { create } from "zustand";

import { SIMULATED_DATA } from "@/core/data";
import { elementBounds } from "@/core/renderer";
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

export type AlignDirection = "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom";

export type EditorStore = {
  design: Design;
  selectedId: string | null;
  selectedIds: string[];
  past: Design[];
  future: Design[];
  load: (design: Design) => void;
  select: (id: string | null) => void;
  toggleSelect: (id: string) => void;
  selectMany: (ids: string[]) => void;
  begin: () => void;
  rename: (name: string) => void;
  setBackground: (color: string) => void;
  update: (id: string, patch: Partial<DesignElement>) => void;
  add: (element: DesignElement) => void;
  remove: (id: string) => void;
  removeSelected: () => void;
  duplicate: (id: string) => void;
  duplicateSelected: () => void;
  translate: (ids: string[], dx: number, dy: number) => void;
  setPositions: (entries: Array<{ id: string; x: number; y: number }>) => void;
  nudge: (id: string, dx: number, dy: number) => void;
  nudgeSelected: (dx: number, dy: number) => void;
  reorder: (id: string, direction: "up" | "down") => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleVisible: (id: string) => void;
  toggleLocked: (id: string) => void;
  align: (direction: AlignDirection) => void;
  distribute: (axis: "horizontal" | "vertical") => void;
  undo: () => void;
  redo: () => void;
};

function nextId(source: string): string {
  return `${source}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useEditor = create<EditorStore>()((set) => ({
  design: TEMPLATES[0].design,
  selectedId: null,
  selectedIds: [],
  past: [],
  future: [],

  load: (design) =>
    set({ design, selectedId: null, selectedIds: [], past: [], future: [] }),

  select: (id) =>
    set({ selectedId: id, selectedIds: id ? [id] : [] }),

  toggleSelect: (id) =>
    set((state) => {
      const exists = state.selectedIds.includes(id);
      const ids = exists
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id];
      return {
        selectedIds: ids,
        selectedId: ids.length > 0 ? ids[ids.length - 1] : null,
      };
    }),

  selectMany: (ids) =>
    set({
      selectedIds: ids,
      selectedId: ids.length > 0 ? ids[ids.length - 1] : null,
    }),

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
      selectedIds: [element.id],
    })),

  remove: (id) =>
    set((state) => {
      const selectedIds = state.selectedIds.filter((item) => item !== id);
      return {
        ...snapshot(state, true),
        design: {
          ...state.design,
          elements: state.design.elements.filter((el) => el.id !== id),
        },
        selectedIds,
        selectedId: selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null,
      };
    }),

  removeSelected: () =>
    set((state) => {
      if (state.selectedIds.length === 0) return state;
      const ids = new Set(state.selectedIds);
      return {
        ...snapshot(state, true),
        design: {
          ...state.design,
          elements: state.design.elements.filter((el) => !ids.has(el.id)),
        },
        selectedIds: [],
        selectedId: null,
      };
    }),

  duplicate: (id) =>
    set((state) => {
      const index = state.design.elements.findIndex((el) => el.id === id);
      if (index < 0) return state;
      const source = state.design.elements[index];
      const copy = {
        ...source,
        id: nextId(source.id),
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
        selectedIds: [copy.id],
      };
    }),

  duplicateSelected: () =>
    set((state) => {
      if (state.selectedIds.length === 0) return state;
      const ids = new Set(state.selectedIds);
      const elements: DesignElement[] = [];
      const created: string[] = [];

      for (const element of state.design.elements) {
        elements.push(element);
        if (!ids.has(element.id)) continue;
        const copy = {
          ...element,
          id: nextId(element.id),
          x: element.x + 12,
          y: element.y + 12,
          locked: false,
        } as DesignElement;
        elements.push(copy);
        created.push(copy.id);
      }

      return {
        ...snapshot(state, true),
        design: { ...state.design, elements },
        selectedIds: created,
        selectedId: created.length > 0 ? created[created.length - 1] : null,
      };
    }),

  translate: (ids, dx, dy) =>
    set((state) => {
      if (ids.length === 0) return state;
      const target = new Set(ids);
      return {
        design: {
          ...state.design,
          elements: state.design.elements.map((el) =>
            target.has(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
          ),
        },
      };
    }),

  setPositions: (entries) =>
    set((state) => {
      if (entries.length === 0) return state;
      const positions = new Map(entries.map((entry) => [entry.id, entry]));
      return {
        design: {
          ...state.design,
          elements: state.design.elements.map((el) => {
            const next = positions.get(el.id);
            return next ? { ...el, x: next.x, y: next.y } : el;
          }),
        },
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

  nudgeSelected: (dx, dy) =>
    set((state) => {
      if (state.selectedIds.length === 0) return state;
      const ids = new Set(state.selectedIds);
      return {
        ...snapshot(state),
        design: {
          ...state.design,
          elements: state.design.elements.map((el) =>
            ids.has(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
          ),
        },
      };
    }),

  reorder: (id, direction) =>    set((state) => {
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

  bringToFront: (id) =>
    set((state) => {
      const element = state.design.elements.find((el) => el.id === id);
      if (!element) return state;
      return {
        ...snapshot(state, true),
        design: {
          ...state.design,
          elements: [
            ...state.design.elements.filter((el) => el.id !== id),
            element,
          ],
        },
      };
    }),

  sendToBack: (id) =>
    set((state) => {
      const element = state.design.elements.find((el) => el.id === id);
      if (!element) return state;
      return {
        ...snapshot(state, true),
        design: {
          ...state.design,
          elements: [
            element,
            ...state.design.elements.filter((el) => el.id !== id),
          ],
        },
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

  align: (direction) =>
    set((state) => {
      if (state.selectedIds.length === 0) return state;
      const ids = new Set(state.selectedIds);

      return {
        ...snapshot(state, true),
        design: {
          ...state.design,
          elements: state.design.elements.map((el) => {
            if (!ids.has(el.id)) return el;
            const bounds = elementBounds(el, SIMULATED_DATA);
            let dx = 0;
            let dy = 0;

            if (direction === "left") dx = -bounds.x;
            if (direction === "hcenter") dx = 195 - (bounds.x + bounds.w / 2);
            if (direction === "right") dx = 390 - (bounds.x + bounds.w);
            if (direction === "top") dy = -bounds.y;
            if (direction === "vcenter") dy = 195 - (bounds.y + bounds.h / 2);
            if (direction === "bottom") dy = 390 - (bounds.y + bounds.h);

            return { ...el, x: Math.round((el.x + dx) * 10) / 10, y: Math.round((el.y + dy) * 10) / 10 };
          }),
        },
      };
    }),

  distribute: (axis) =>
    set((state) => {
      const ids = new Set(state.selectedIds);
      const items = state.design.elements
        .filter((el) => ids.has(el.id))
        .map((el) => ({ el, bounds: elementBounds(el, SIMULATED_DATA) }));

      if (items.length < 3) return state;

      const center = (item: (typeof items)[number]) =>
        axis === "horizontal"
          ? item.bounds.x + item.bounds.w / 2
          : item.bounds.y + item.bounds.h / 2;

      items.sort((a, b) => center(a) - center(b));
      const start = center(items[0]);
      const end = center(items[items.length - 1]);
      const step = (end - start) / (items.length - 1);

      const deltas = new Map<string, number>();
      items.forEach((item, index) => {
        if (index === 0 || index === items.length - 1) return;
        deltas.set(item.el.id, start + step * index - center(item));
      });

      return {
        ...snapshot(state, true),
        design: {
          ...state.design,
          elements: state.design.elements.map((el) => {
            const delta = deltas.get(el.id);
            if (delta === undefined) return el;
            return axis === "horizontal"
              ? { ...el, x: Math.round((el.x + delta) * 10) / 10 }
              : { ...el, y: Math.round((el.y + delta) * 10) / 10 };
          }),
        },
      };
    }),

  undo: () =>
    set((state) => {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        design: previous,
        past: state.past.slice(0, -1),
        future: [state.design, ...state.future].slice(0, HISTORY_LIMIT),
        selectedId: null,
        selectedIds: [],
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
        selectedIds: [],
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
