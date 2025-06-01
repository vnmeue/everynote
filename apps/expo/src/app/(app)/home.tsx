import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, IconButton, Text, TextInput } from "react-native-paper";

import type { categories, notes } from "../../db/schema";
import { categoriesOperations, notesOperations } from "../../db";

type Note = typeof notes.$inferSelect;
type Category = typeof categories.$inferSelect;

export default function HomeScreen() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedNotes, loadedCategories] = await Promise.all([
        notesOperations.getAll(),
        categoriesOperations.getAll(),
      ]);
      setNotes(loadedNotes);
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;

    try {
      await notesOperations.create(
        "Untitled Note",
        note,
        selectedCategory || undefined,
      );
      setNote("");
      loadData(); // Reload notes
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || note.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header with Search and Profile */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <IconButton icon="magnify" size={24} />
          <TextInput
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            mode="outlined"
          />
        </View>
        <View style={styles.headerButtons}>
          <IconButton icon="calendar" size={24} />
          <IconButton icon="account" size={24} />
        </View>
      </View>

      {/* Category Selectors */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
      >
        <Chip
          selected={selectedCategory === null}
          onPress={() => setSelectedCategory(null)}
          style={styles.categoryChip}
        >
          All
        </Chip>
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={styles.categoryChip}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Notes List */}
      <ScrollView style={styles.notesList}>
        {filteredNotes.map((note) => (
          <View key={note.id} style={styles.noteItem}>
            <Text variant="titleMedium">{note.title}</Text>
            <Text variant="bodyMedium" numberOfLines={2}>
              {note.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Notes Editor */}
      <View style={styles.editor}>
        <TextInput
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="Start typing your note..."
          style={styles.noteInput}
          mode="outlined"
          right={
            <TextInput.Icon
              icon="content-save"
              onPress={() => void handleSaveNote()}
              disabled={!note.trim()}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: -8,
  },
  headerButtons: {
    flexDirection: "row",
  },
  categories: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  categoryChip: {
    marginRight: 8,
  },
  notesList: {
    flex: 1,
    padding: 16,
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  editor: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  noteInput: {
    flex: 1,
    textAlignVertical: "top",
  },
});
