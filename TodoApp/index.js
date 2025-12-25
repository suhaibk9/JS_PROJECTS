// ============================================
// STATE MANAGEMENT
// ============================================
let activeFilter = "all";
let isEditing = false;
let editingId = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// ============================================
// LOCALSTORAGE OPERATIONS
// ============================================
const StorageService = {
  getTodos: () => {
    const todos = localStorage.getItem("todos");
    return todos ? JSON.parse(todos) : [];
  },

  saveTodos: (todos) => {
    localStorage.setItem("todos", JSON.stringify(todos));
  },

  addTodo: (todoText) => {
    const todos = StorageService.getTodos();
    todos.unshift({
      id: generateId(),
      todoText: todoText,
      completed: false,
    });
    StorageService.saveTodos(todos);
  },

  deleteTodo: (todoId) => {
    const todos = StorageService.getTodos();
    const filteredTodos = todos.filter((todo) => todo.id !== todoId);
    StorageService.saveTodos(filteredTodos);
  },

  updateTodo: (todoId, todoText) => {
    const todos = StorageService.getTodos();
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
      todo.todoText = todoText;
      StorageService.saveTodos(todos);
    }
  },

  toggleComplete: (todoId) => {
    const todos = StorageService.getTodos();
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
      todo.completed = true;
      StorageService.saveTodos(todos);
    }
  },
};

// ============================================
// FILTER LOGIC
// ============================================
const filterTodos = (todos) => {
  if (activeFilter === "pending") {
    return todos.filter((todo) => !todo.completed);
  } else if (activeFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  return todos; // "all"
};

// ============================================
// UI HELPERS
// ============================================
const createButton = (text, className) => {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.classList.add(className);
  return btn;
};

const showCancelButton = (addBtn, inputBox, todoContainer) => {
  let cancelBtn = document.getElementById("cancelBtn");
  if (!cancelBtn) {
    cancelBtn = createButton("Cancel", "cancelBtn");
    cancelBtn.id = "cancelBtn";
    cancelBtn.style.marginLeft = "10px";
    addBtn.after(cancelBtn);

    cancelBtn.addEventListener("click", () => {
      resetEditMode(inputBox, addBtn);
    });
  }
};

const resetEditMode = (inputBox, addBtn) => {
  isEditing = false;
  editingId = null;
  inputBox.value = "";
  addBtn.textContent = "Add Todo";

  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) {
    cancelBtn.remove();
  }
};

// ============================================
// TODO ACTIONS
// ============================================
const TodoActions = {
  add: (inputBox, todoContainer) => {
    const todoText = inputBox.value.trim();
    if (!todoText) {
      alert("Please Add Text!");
      return;
    }

    StorageService.addTodo(todoText);
    inputBox.value = "";
    renderTodos(todoContainer);
  },

  delete: (todoId, todoContainer) => {
    StorageService.deleteTodo(todoId);
    renderTodos(todoContainer);
  },

  complete: (todoId, todoContainer) => {
    StorageService.toggleComplete(todoId);
    renderTodos(todoContainer);
  },

  startEdit: (todoId, todoContainer) => {
    const todos = StorageService.getTodos();
    const todo = todos.find((t) => t.id === todoId);
    const inputBox = document.getElementById("todo-input");
    const addBtn = document.getElementById("addBtn");

    isEditing = true;
    editingId = todoId;
    inputBox.value = todo.todoText;
    addBtn.textContent = "Update Todo";

    showCancelButton(addBtn, inputBox, todoContainer);
  },

  update: (inputBox, todoContainer) => {
    const todoText = inputBox.value.trim();
    if (!todoText) {
      alert("Please Add Text!");
      return;
    }

    StorageService.updateTodo(editingId, todoText);
    const addBtn = document.getElementById("addBtn");
    resetEditMode(inputBox, addBtn);
    renderTodos(todoContainer);
  },
};
// ============================================
// RENDER FUNCTIONS
// ============================================
const createTodoItem = (todo, todoContainer) => {
  const li = document.createElement("li");
  li.classList.add("todo-item");
  li.dataset.id = todo.id;
  if (todo.completed) {
    li.classList.add("todo-done");
  }
  const text = document.createElement("span");
  text.textContent = todo.todoText;

  const wrapper = document.createElement("div");
  wrapper.classList.add("btn-wrapper");

  const editBtn = createButton("✏️", "editBtn");
  const deleteBtn = createButton("🗑️", "deleteBtn");
  const completeBtn = createButton("✅", "completeBtn");

  // Event listeners
  deleteBtn.addEventListener("click", (e) => {
    const todoId = e.target.closest(".todo-item").dataset.id;
    TodoActions.delete(todoId, todoContainer);
  });

  completeBtn.addEventListener("click", (e) => {
    const todoId = e.target.closest(".todo-item").dataset.id;
    TodoActions.complete(todoId, todoContainer);
  });

  editBtn.addEventListener("click", (e) => {
    const todoId = e.target.closest(".todo-item").dataset.id;
    TodoActions.startEdit(todoId, todoContainer);
  });

  // Assemble
  li.append(text);
  wrapper.append(editBtn);
  wrapper.append(deleteBtn);
  if (!todo.completed) wrapper.append(completeBtn);
  li.append(wrapper);

  return li;
};

const renderTodos = (todoContainer) => {
  let todos = StorageService.getTodos();
  todos = filterTodos(todos);

  todoContainer.innerHTML = "";

  if (todos.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.classList.add("empty-state");
    if (activeFilter === "all") {
      emptyMsg.textContent =
        "You don’t have any todos yet. Add one to get started.";
    } else if (activeFilter === "pending") {
      emptyMsg.textContent = "No pending todos. Everything’s under control.";
    } else {
      emptyMsg.textContent =
        "No completed todos yet. Check things off as you go.";
    }
    todoContainer.append(emptyMsg);
    return;
  }

  todos.forEach((todo) => {
    const todoItem = createTodoItem(todo, todoContainer);
    todoContainer.append(todoItem);
  });
};

// ============================================
// MAIN ADD TODO HANDLER
// ============================================
const handleAddTodo = (evt, inputBox, container) => {
  const todoText = inputBox.value.trim();
  if (!todoText) {
    alert("Please Add Text!");
    return;
  }

  if (isEditing) {
    TodoActions.update(inputBox, container);
  } else {
    TodoActions.add(inputBox, container);
  }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const inputBox = document.getElementById("todo-input");
  const addBtn = document.getElementById("addBtn");
  const container = document.querySelector(".container");

  // Create todo list container
  const todoContainer = document.createElement("ul");
  todoContainer.id = "todo-container";
  container.append(todoContainer);

  // Event listeners for adding todos
  inputBox.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      handleAddTodo(evt, inputBox, todoContainer);
    }
  });

  addBtn.addEventListener("click", (evt) => {
    handleAddTodo(evt, inputBox, todoContainer);
  });

  // Create filter buttons
  const filterBtns = document.createElement("div");
  const allBtn = createButton("All", "filterBtn");
  const pendingBtn = createButton("Pending", "filterBtn");
  const completedBtn = createButton("Completed", "filterBtn");

  allBtn.dataset.filter = "all";
  pendingBtn.dataset.filter = "pending";
  completedBtn.dataset.filter = "completed";

  filterBtns.append(allBtn, pendingBtn, completedBtn);
  todoContainer.before(filterBtns);

  // Filter button listeners
  const filterButtons = document.querySelectorAll(".filterBtn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      activeFilter = e.target.dataset.filter;
      renderTodos(todoContainer);
    });
  });

  // Initial render
  renderTodos(todoContainer);
});
