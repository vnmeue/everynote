import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { categories, notes } from "../db/schema";

export interface Note {
  id: number;
  title: string;
  content: string;
  categoryId: number | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useNotes() {
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const userId = await AsyncStorage.getItem("userToken");
      if (!userId) return;

      const allNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.userId, userId));
      const allCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId));

      setUserNotes(allNotes);
      setUserCategories(allCategories);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (
    title: string,
    content: string,
    categoryId?: number,
  ) => {
    try {
      const userId = await AsyncStorage.getItem("userToken");
      if (!userId) throw new Error("User not authenticated");

      const [newNote] = await db
        .insert(notes)
        .values({
          title,
          content,
          categoryId: categoryId || null,
          userId,
        })
        .returning();

      setUserNotes((prev) => [...prev, newNote]);
      return newNote;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  };

  const updateNote = async (id: number, updates: Partial<Note>) => {
    try {
      const [updatedNote] = await db
        .update(notes)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(notes.id, id))
        .returning();

      setUserNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote : note)),
      );
      return updatedNote;
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await db.delete(notes).where(eq(notes.id, id));
      setUserNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  };

  const createCategory = async (name: string) => {
    try {
      const userId = await AsyncStorage.getItem("userToken");
      if (!userId) throw new Error("User not authenticated");

      const [newCategory] = await db
        .insert(categories)
        .values({
          name,
          userId,
        })
        .returning();

      setUserCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  return {
    notes: userNotes,
    categories: userCategories,
    loading,
    createNote,
    updateNote,
    deleteNote,
    createCategory,
    refreshNotes: loadNotes,
  };
}
