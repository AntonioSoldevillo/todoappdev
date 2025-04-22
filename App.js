import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import axios from "axios";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const API_URL = "https://backendfastapi-rdsf.onrender.com/todos/";

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addTask = () => {
    if (task.trim() === "") return;
    axios
      .post(API_URL, { title: task, completed: false })
      .then((res) => {
        setTasks([...tasks, res.data]);
        setTask("");
      });
  };

  const removeTask = (id) => {
    axios.delete(`${API_URL}${id}/`).then(() => {
      setTasks(tasks.filter((t) => t.id !== id));
    });
  };

  const toggleComplete = (id) => {
    const taskToUpdate = tasks.find((t) => t.id === id);
    axios
      .put(`${API_URL}${id}/`, {
        title: taskToUpdate.title,
        completed: !taskToUpdate.completed,
      })
      .then((res) =>
        setTasks(tasks.map((t) => (t.id === id ? res.data : t)))
      );
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditText(tasks[index].title);
  };

  const saveEdit = (id) => {
    const taskToUpdate = tasks.find((t) => t.id === id);
    axios
      .put(`${API_URL}${id}/`, {
        title: editText,
        completed: taskToUpdate.completed,
      })
      .then((res) => {
        setTasks(tasks.map((t) => (t.id === id ? res.data : t)));
        setEditingIndex(null);
      });
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#121212" : "#fefefe" },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.header,
            { color: darkMode ? "#ffffff" : "#333333" },
          ]}
        >
          📋 My To-Do
        </Text>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Text style={styles.toggleIcon}>{darkMode ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
          },
        ]}
        placeholder="Add a new task..."
        placeholderTextColor={darkMode ? "#888" : "#aaa"}
        value={task}
        onChangeText={setTask}
      />

      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: darkMode ? "#03dac6" : "#6200ee" },
        ]}
        onPress={addTask}
      >
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>

      <View style={styles.filterButtons}>
        {["all", "completed", "pending"].map((type) => (
          <TouchableOpacity key={type} onPress={() => setFilter(type)}>
            <Text
              style={{
                color:
                  filter === type
                    ? darkMode
                      ? "#03dac6"
                      : "#6200ee"
                    : darkMode
                    ? "#888"
                    : "#666",
                fontWeight: filter === type ? "bold" : "normal",
                marginHorizontal: 8,
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.taskItem,
              {
                backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
                borderColor: darkMode ? "#444" : "#ddd",
              },
            ]}
          >
            {editingIndex === index ? (
              <>
                <TextInput
                  style={[styles.editInput, { color: darkMode ? "#fff" : "#000" }]}
                  value={editText}
                  onChangeText={setEditText}
                />
                <TouchableOpacity onPress={() => saveEdit(item.id)}>
                  <Text style={styles.saveBtn}>💾</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                  <Text style={{ fontSize: 20, marginRight: 10 }}>
                    {item.completed ? "✅" : "☐"}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    color: darkMode ? "#fff" : "#333",
                    textDecorationLine: item.completed ? "line-through" : "none",
                  }}
                >
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => startEditing(index)}>
                  <Text style={styles.editBtn}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTask(item.id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
  },
  toggleIcon: {
    fontSize: 24,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  editInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    marginRight: 10,
  },
  editBtn: {
    fontSize: 18,
    marginLeft: 10,
  },
  deleteBtn: {
    fontSize: 18,
    marginLeft: 10,
    color: "#e53935",
  },
  saveBtn: {
    fontSize: 18,
    color: "#03dac6",
  },
});
