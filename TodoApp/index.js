//active-filter
let activeFilter = "all";

// Generate unique ID for todos
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// Retrieve all todos from localStorage
const allTodos = () => {
  const todos = localStorage.getItem("todos");
  return todos ? JSON.parse(todos) : [];
};

// Delete a todo by its ID and re-render the list
const deleteTodo = (todoId, todoContainer) => {
  const todos = allTodos();
  const newTodos = todos.filter((todo) => todo.id !== todoId);
  localStorage.setItem("todos", JSON.stringify(newTodos));
  renderTodos(todoContainer);
};

const markCompleted = (todoId) => {
  const todos = allTodos();
  const todo = todos.find((t) => t.id === todoId);
  if (todo) {
    todo.completed = true;
    localStorage.setItem("todos", JSON.stringify(todos));
  }
};

// Save a new todo to localStorage (adds to the start)
const saveTodos = (todoText) => {
  const existingTodos = allTodos();
  existingTodos.unshift({
    id: generateId(),
    todoText: todoText,
    completed: false,
  });
  localStorage.setItem("todos", JSON.stringify(existingTodos));
};

//Edit Todo
let isEditing = false;
let editingId = null;

const editTodo = (todoId, todoContainer) => {
  const todos = allTodos();
  const todo = todos.find((t) => t.id === todoId);
  const inputBox = document.getElementById("todo-input");
  const addBtn = document.getElementById("addBtn");

  // Set editing mode
  isEditing = true;
  editingId = todoId;

  // Populate input with todo text
  inputBox.value = todo.todoText;
  addBtn.textContent = "Update Todo";

  // Create cancel button if it doesn't exist
  let cancelBtn = document.getElementById("cancelBtn");
  if (!cancelBtn) {
    cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelBtn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginLeft = "10px";
    addBtn.after(cancelBtn);

    cancelBtn.addEventListener("click", () => {
      cancelEdit(inputBox, addBtn, todoContainer);
    });
  }
};

const cancelEdit = (inputBox, addBtn, todoContainer) => {
  isEditing = false;
  editingId = null;
  inputBox.value = "";
  addBtn.textContent = "Add Todo";

  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) {
    cancelBtn.remove();
  }
};

const updateTodo = (inputBox, todoContainer) => {
  const todoText = inputBox.value.trim();
  if (!todoText) {
    alert("Please Add Text!");
    return;
  }

  const todos = allTodos();
  const todo = todos.find((t) => t.id === editingId);
  if (todo) {
    todo.todoText = todoText;
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  // Reset editing state
  const addBtn = document.getElementById("addBtn");
  cancelEdit(inputBox, addBtn, todoContainer);
  renderTodos(todoContainer);
};
// Render all todos in the given container
const renderTodos = (todoContainer) => {
  let todos = allTodos();

  // Apply filter based on activeFilter
  if (activeFilter === "pending") {
    todos = todos.filter((todo) => !todo.completed);
  } else if (activeFilter === "completed") {
    todos = todos.filter((todo) => todo.completed);
  }
  // "all" shows everything, no filtering needed

  todoContainer.innerHTML = "";
  if (todos.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.classList.add("empty-state");
    emptyMsg.textContent = "Nothing here yet — add your first todo.";
    todoContainer.append(emptyMsg);
    return;
  }
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    li.dataset.id = todo.id; // Store todo ID in data attribute

    // text
    const text = document.createElement("span");
    text.textContent = todo.todoText;
    //Buttons Wrapper
    const wrapper = document.createElement("div");
    wrapper.classList.add("btn-wrapper");
    // edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("editBtn");
    // delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("deleteBtn");
    //Complete button
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✅";
    completeBtn.classList.add("completeBtn");
    //Listeners:
    // for Delete
    deleteBtn.addEventListener("click", (e) => {
      const todoId = e.target.closest(".todo-item").dataset.id;
      deleteTodo(todoId, todoContainer);
    });
    //for complete
    completeBtn.addEventListener("click", (e) => {
      const todoId = e.target.closest(".todo-item").dataset.id;
      markCompleted(todoId);
      renderTodos(todoContainer);
    });
    //for edit
    editBtn.addEventListener("click", (e) => {
      const todoId = e.target.closest(".todo-item").dataset.id;
      editTodo(todoId, todoContainer);
    });
    // assemble
    li.append(text);
    wrapper.append(editBtn);
    wrapper.append(deleteBtn);
    if (!todo.completed) wrapper.append(completeBtn);
    li.append(wrapper);
    todoContainer.append(li);
  });
};
// Add a new todo from the input box
const addTodo = (evt, inputBox, container) => {
  const todoText = inputBox.value.trim();
  if (!todoText) {
    alert("Please Add Text!");
    return;
  }

  // Check if we're in editing mode
  if (isEditing) {
    updateTodo(inputBox, container);
    return;
  }

  saveTodos(todoText);
  console.log("Saved:", todoText);
  inputBox.value = "";
  renderTodos(container);
};

// Wait for the DOM to load before running the app logic
document.addEventListener("DOMContentLoaded", () => {
  // Get references to input, button, and container elements
  const inputBox = document.getElementById("todo-input");
  const addBtn = document.getElementById("addBtn");
  const container = document.querySelector(".container");

  // Create the todo list container
  const todoContainer = document.createElement("ul");
  todoContainer.id = "todo-container";
  container.append(todoContainer);

  // Add todo on Enter key
  inputBox.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      addTodo(evt, inputBox, todoContainer);
    }
  });
  // Add todo on button click
  addBtn.addEventListener("click", (evt) => {
    addTodo(evt, inputBox, todoContainer);
  });

  // Create filter buttons: All, Pending, Completed
  const filterBtns = document.createElement("div");
  const allBtn = document.createElement("button");
  const pendingBtn = document.createElement("button");
  const completedBtn = document.createElement("button");

  allBtn.classList.add("filterBtn");
  allBtn.dataset.filter = "all";
  allBtn.textContent = "All";

  pendingBtn.classList.add("filterBtn");
  pendingBtn.dataset.filter = "pending";
  pendingBtn.textContent = "Pending";

  completedBtn.classList.add("filterBtn");
  completedBtn.dataset.filter = "completed";
  completedBtn.textContent = "Completed";

  filterBtns.append(allBtn);
  filterBtns.append(pendingBtn);
  filterBtns.append(completedBtn);

  // Insert filter buttons before the todo list
  todoContainer.before(filterBtns);

  //Listeners - Use event delegation on all filter buttons
  const filterButtons = document.querySelectorAll(".filterBtn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      activeFilter = e.target.dataset.filter;
      renderTodos(todoContainer);
    });
  });
  // Initial render of todos
  renderTodos(todoContainer);
});
