import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
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
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addTask = () => {
    if (task.trim() === "") return;
    axios
      .post(API_URL, { title: task, completed: false })
      .then((response) => {
        setTasks([...tasks, response.data]);
        setTask("");
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  const removeTask = (id) => {
    axios
      .delete(`${API_URL}${id}/`)
      .then(() => setTasks(tasks.filter((t) => t.id !== id)))
      .catch((error) => console.error("Error removing task:", error));
  };

  const toggleComplete = (id) => {
    const taskToUpdate = tasks.find((t) => t.id === id);
    axios
      .put(`${API_URL}${id}/`, {
        title: taskToUpdate.title,
        completed: !taskToUpdate.completed,
      })
      .then((response) => {
        setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
      })
      .catch((error) => console.error("Error toggling completion:", error));
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
      .then((response) => {
        setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
        setEditingIndex(null);
      })
      .catch((error) => console.error("Error saving task:", error));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? "#121212" : "#f5f5f5" }]}>
      <Text style={[styles.header, { color: darkMode ? "white" : "black" }]}>To-Do List</Text>

      <Button
        title={darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        onPress={toggleDarkMode}
        color={darkMode ? "#bb86fc" : "#6200ee"}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: darkMode ? "#1e1e1e" : "white",
            color: darkMode ? "white" : "black",
          },
        ]}
        placeholder="Add a new task..."
        placeholderTextColor={darkMode ? "#ccc" : "#888"}
        value={task}
        onChangeText={setTask}
      />
      <Button title="Add Task" onPress={addTask} color={darkMode ? "#03dac6" : "#03a9f4"} />

      <View style={styles.filterButtons}>
        {["all", "completed", "pending"].map((type) => (
          <TouchableOpacity key={type} onPress={() => setFilter(type)}>
            <Text
              style={{
                color: filter === type ? (darkMode ? "#03dac6" : "#6200ee") : darkMode ? "#aaa" : "#555",
                marginHorizontal: 10,
                fontWeight: filter === type ? "bold" : "normal",
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
                backgroundColor: darkMode ? "#1e1e1e" : "#fff",
                borderColor: darkMode ? "#333" : "#ccc",
              },
            ]}
          >
            {editingIndex === index ? (
              <>
                <TextInput
                  style={[styles.input, { flex: 1, color: darkMode ? "white" : "black" }]}
                  value={editText}
                  onChangeText={setEditText}
                />
                <Button title="Save" onPress={() => saveEdit(item.id)} color={darkMode ? "#bb86fc" : "#6200ee"} />
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => toggleComplete(item.id)}>
                  <Text
                    style={{
                      color: item.completed ? "#03dac6" : "#6200ee",
                      fontSize: 20,
                      marginRight: 10,
                    }}
                  >
                    ✔️
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    color: darkMode ? "white" : "black",
                    textDecorationLine: item.completed ? "line-through" : "none",
                  }}
                >
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => startEditing(index)}>
                  <Text style={{ color: darkMode ? "#03dac6" : "#2196f3" }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTask(item.id)}>
                  <Text style={{ color: "red", marginLeft: 10 }}>❌</Text>
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
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
});
