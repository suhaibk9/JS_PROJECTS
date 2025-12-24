const allTodos = () => {
  const todos = localStorage.getItem("todos");
  return todos ? JSON.parse(todos) : [];
};

const saveTodos = (todoText) => {
  const existingTodos = allTodos();
  existingTodos.unshift(todoText);
  localStorage.setItem("todos", JSON.stringify(existingTodos));
};
const renderTodos = (todoContainer) => {
  const todos = allTodos();
  todoContainer.innerHTML = "";

  todos.forEach((todo) => {
    const div = document.createElement("div");
    div.textContent = todo;
    todoContainer.appendChild(div);
  });
};
const addTodo = (evt, inputBox) => {
  const todoText = inputBox.value.trim();
  if (!todoText) {
    alert("Please Add Text!");
    return;
  }
  saveTodos(todoText);
  console.log("Saved:", todoText);
  inputBox.value = "";
};

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("todo-input");
  const addBtn = document.getElementById("addBtn");

  // Enter key
  inputBox.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      addTodo(evt, inputBox);
    }
  });
  // Button click
  addBtn.addEventListener("click", (evt) => {
    addTodo(evt, inputBox);
  });
  const container = document.querySelector(".container");
  const todoContainer = document.createElement("div");
  todoContainer.id = "todo-container";
  container.appendChild(todoContainer);
  renderTodos(todoContainer);
});
