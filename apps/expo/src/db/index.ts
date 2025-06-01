import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { initDatabase } from "./init";

// Initialize database
export const db = initDatabase();

// Helper function to get the current user ID
export const getCurrentUserId = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (!token) throw new Error("No user token found");
  return token;
};

// Helper function to execute SQL queries
const executeQuery = (query: string, params: any[] = []) => {
  return new Promise<any>((resolve, reject) => {
    db.transaction(
      (tx: any) => {
        tx.executeSql(query, params, (_: any, result: any) => {
          resolve(result);
        });
      },
      (error: any) => {
        reject(error);
      },
    );
  });
};

// Notes operations
export const notesOperations = {
  async create(title: string, content: string, categoryId?: number) {
    const userId = await getCurrentUserId();
    const query = `
      INSERT INTO notes (title, content, category_id, user_id)
      VALUES (?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [
      title,
      content,
      categoryId || null,
      userId,
    ]);
    return result;
  },

  async update(
    id: number,
    data: { title?: string; content?: string; categoryId?: number },
  ) {
    const updates = [];
    const params = [];

    if (data.title) {
      updates.push("title = ?");
      params.push(data.title);
    }
    if (data.content) {
      updates.push("content = ?");
      params.push(data.content);
    }
    if (data.categoryId !== undefined) {
      updates.push("category_id = ?");
      params.push(data.categoryId);
    }

    updates.push('updated_at = strftime("%s", "now")');
    params.push(id);

    const query = `
      UPDATE notes
      SET ${updates.join(", ")}
      WHERE id = ?
    `;
    return executeQuery(query, params);
  },

  async delete(id: number) {
    const query = "DELETE FROM notes WHERE id = ?";
    return executeQuery(query, [id]);
  },

  async getAll() {
    const userId = await getCurrentUserId();
    const query = `
      SELECT * FROM notes
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `;
    const result = await executeQuery(query, [userId]);
    return result.rows._array;
  },

  async getByCategory(categoryId: number) {
    const userId = await getCurrentUserId();
    const query = `
      SELECT * FROM notes
      WHERE user_id = ? AND category_id = ?
      ORDER BY updated_at DESC
    `;
    const result = await executeQuery(query, [userId, categoryId]);
    return result.rows._array;
  },
};

// Categories operations
export const categoriesOperations = {
  async create(name: string) {
    const userId = await getCurrentUserId();
    const query = `
      INSERT INTO categories (name, user_id)
      VALUES (?, ?)
    `;
    return executeQuery(query, [name, userId]);
  },

  async update(id: number, name: string) {
    const query = `
      UPDATE categories
      SET name = ?, updated_at = strftime("%s", "now")
      WHERE id = ?
    `;
    return executeQuery(query, [name, id]);
  },

  async delete(id: number) {
    const query = "DELETE FROM categories WHERE id = ?";
    return executeQuery(query, [id]);
  },

  async getAll() {
    const userId = await getCurrentUserId();
    const query = `
      SELECT * FROM categories
      WHERE user_id = ?
      ORDER BY name ASC
    `;
    const result = await executeQuery(query, [userId]);
    return result.rows._array;
  },
};
