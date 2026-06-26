import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Arrays are more suited to do JSON serialization to localStorage.
      favoriteIds: [],

      toggleFavorite: (id: string) => {
        const current = get().favoriteIds;
        const next = current.includes(id)
          ? current.filter((favId) => favId !== id)
          : [...current, id];
        set({ favoriteIds: next });
      },

      isFavorited: (id: string) => get().favoriteIds.includes(id),
    }),
    {
      name: "roast-and-ritual-favorites", // localStorage key
    }
  )
);