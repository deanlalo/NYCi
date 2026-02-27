import { useState, useEffect, useCallback, useRef } from 'react';
import { generateId } from '../utils/uuid';
import { loadEstimate, saveEstimate } from '../utils/storage';
import { getPrices, getItemPrice } from '../utils/prices';

function createDefaultState() {
  return {
    project: {
      address: '',
      contactName: '',
      contactPhone: '',
      constructionType: 'ground-up',
    },
    floors: [
      {
        id: generateId(),
        label: 'Floor 1',
        items: [],
      },
    ],
    attachments: [],
  };
}

export function useEstimate() {
  const isFirstLoad = useRef(true);
  const [restored, setRestored] = useState(false);

  const [state, setState] = useState(() => {
    const saved = loadEstimate();
    if (saved && saved.floors) {
      return saved;
    }
    return createDefaultState();
  });

  /* detect restore on first mount */
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      const saved = loadEstimate();
      if (saved && saved.floors && saved.floors.length > 0) {
        const hasContent =
          saved.project?.address ||
          saved.floors.some((f) => f.items && f.items.length > 0);
        if (hasContent) setRestored(true);
      }
    }
  }, []);

  /* autosave on every change */
  useEffect(() => {
    saveEstimate(state);
  }, [state]);

  const prices = getPrices();

  /* ── Project ──────────────────────────── */

  const updateProject = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      project: { ...prev.project, ...updates },
    }));
  }, []);

  /* ── Floors ───────────────────────────── */

  const addFloor = useCallback(() => {
    setState((prev) => ({
      ...prev,
      floors: [
        ...prev.floors,
        {
          id: generateId(),
          label: `Floor ${prev.floors.length + 1}`,
          items: [],
        },
      ],
    }));
  }, []);

  const removeFloor = useCallback((floorId) => {
    setState((prev) => ({
      ...prev,
      floors: prev.floors.filter((f) => f.id !== floorId),
    }));
  }, []);

  const updateFloorLabel = useCallback((floorId, label) => {
    setState((prev) => ({
      ...prev,
      floors: prev.floors.map((f) =>
        f.id === floorId ? { ...f, label } : f
      ),
    }));
  }, []);

  /* ── Items ────────────────────────────── */

  const addItem = useCallback(
    (floorId, type, customName = '', customPrice = 0) => {
      setState((prev) => ({
        ...prev,
        floors: prev.floors.map((f) => {
          if (f.id !== floorId) return f;

          /* standard item — increment if already on floor */
          if (type !== 'Custom') {
            const existing = f.items.find((i) => i.type === type);
            if (existing) {
              return {
                ...f,
                items: f.items.map((i) =>
                  i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
                ),
              };
            }
          }

          /* custom item — merge by name */
          if (type === 'Custom') {
            const existing = f.items.find(
              (i) => i.type === 'Custom' && i.customName === customName
            );
            if (existing) {
              return {
                ...f,
                items: f.items.map((i) =>
                  i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
                ),
              };
            }
          }

          return {
            ...f,
            items: [
              ...f.items,
              {
                id: generateId(),
                type,
                customName: type === 'Custom' ? customName : '',
                customPrice: type === 'Custom' ? Number(customPrice) : 0,
                qty: 1,
              },
            ],
          };
        }),
      }));
    },
    []
  );

  const incrementItem = useCallback((floorId, itemId) => {
    setState((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => {
        if (f.id !== floorId) return f;
        return {
          ...f,
          items: f.items.map((i) =>
            i.id === itemId ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }),
    }));
  }, []);

  const decrementItem = useCallback((floorId, itemId) => {
    setState((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => {
        if (f.id !== floorId) return f;
        return {
          ...f,
          items: f.items
            .map((i) => (i.id === itemId ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        };
      }),
    }));
  }, []);

  const removeItem = useCallback((floorId, itemId) => {
    setState((prev) => ({
      ...prev,
      floors: prev.floors.map((f) => {
        if (f.id !== floorId) return f;
        return { ...f, items: f.items.filter((i) => i.id !== itemId) };
      }),
    }));
  }, []);

  /* ── Attachments ──────────────────────── */

  const addAttachments = useCallback((files) => {
    setState((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        ...files.map((f) => ({ name: f.name, size: f.size })),
      ],
    }));
  }, []);

  const removeAttachment = useCallback((index) => {
    setState((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  }, []);

  /* ── New Estimate ─────────────────────── */

  const newEstimate = useCallback(() => {
    setState(createDefaultState());
    setRestored(false);
  }, []);

  const dismissRestored = useCallback(() => {
    setRestored(false);
  }, []);

  /* ── Computed ──────────────────────────── */

  const getFloorTotal = useCallback(
    (floor) => {
      return floor.items.reduce(
        (sum, item) => sum + getItemPrice(item, prices) * item.qty,
        0
      );
    },
    [prices]
  );

  const grandTotal = state.floors.reduce(
    (sum, floor) =>
      sum +
      floor.items.reduce(
        (s, item) => s + getItemPrice(item, prices) * item.qty,
        0
      ),
    0
  );

  return {
    state,
    prices,
    restored,
    updateProject,
    addFloor,
    removeFloor,
    updateFloorLabel,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    addAttachments,
    removeAttachment,
    newEstimate,
    dismissRestored,
    getFloorTotal,
    grandTotal,
  };
}
