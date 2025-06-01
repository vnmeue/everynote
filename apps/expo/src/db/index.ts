import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "./schema";

// Open the database
const sqlite = SQLite.openDatabaseSync("everynote.db");

// Create the database instance
export const db = drizzle(sqlite, { schema });

export type Database = typeof db;

// Helper function to get the current user ID
export const getCurrentUserId = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("No user token found");
  return token; // Using token as userId for now
};

// Notes operations
export const notesOperations = {
  async create(title: string, content: string, categoryId?: number) {
    const userId = await getCurrentUserId();
    return db.insert(schema.notes).values({
      title,
      content,
      categoryId,
      userId,
    });
  },

  async update(
    id: number,
    data: { title?: string; content?: string; categoryId?: number },
  ) {
    return db
      .update(schema.notes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.notes.id, id));
  },

  async delete(id: number) {
    return db.delete(schema.notes).where(eq(schema.notes.id, id));
  },

  async getAll() {
    const userId = await getCurrentUserId();
    return db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.userId, userId))
      .orderBy(desc(schema.notes.updatedAt));
  },

  async getByCategory(categoryId: number) {
    const userId = await getCurrentUserId();
    return db
      .select()
      .from(schema.notes)
      .where(
        and(
          eq(schema.notes.userId, userId),
          eq(schema.notes.categoryId, categoryId),
        ),
      )
      .orderBy(desc(schema.notes.updatedAt));
  },
};

// Categories operations
export const categoriesOperations = {
  async create(name: string) {
    const userId = await getCurrentUserId();
    return db.insert(schema.categories).values({
      name,
      userId,
    });
  },

  async update(id: number, name: string) {
    return db
      .update(schema.categories)
      .set({ name, updatedAt: new Date() })
      .where(eq(schema.categories.id, id));
  },

  async delete(id: number) {
    return db.delete(schema.categories).where(eq(schema.categories.id, id));
  },

  async getAll() {
    const userId = await getCurrentUserId();
    return db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.userId, userId))
      .orderBy(asc(schema.categories.name));
  },
};
