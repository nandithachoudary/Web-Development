// Enum for Task Status
enum TaskStatus {
    Pending = "pending",
    Completed = "completed"
}

// Task Class
class Task {
    text: string;
    dueDate: string;
    status: TaskStatus;

    constructor(text: string, dueDate: string = "") {
        this.text = text;
        this.dueDate = dueDate;
        this.status = TaskStatus.Pending;
    }

    toggleStatus(): void {
        this.status = this.status === TaskStatus.Pending ? TaskStatus.Completed : TaskStatus.Pending;
    }
}

// Task List Array
let tasks: Task[] = [];

// Function to Add a Task
function addTask(): void {
    const taskInput = document.getElementById("taskInput") as HTMLInputElement;
    const dueDateInput = document.getElementById("dueDateInput") as HTMLInputElement;

    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = new Task(taskText, dueDate);
    tasks.push(newTask);

    taskInput.value = "";
    dueDateInput.value = "";
    renderTasks();
}

// Function to Toggle Task Status
function toggleTask(index: number): void {
    tasks[index].toggleStatus();
    renderTasks();
}

// Function to Remove a Task
function removeTask(index: number): void {
    tasks.splice(index, 1);
    renderTasks();
}

// Function to Render Tasks
function renderTasks(): void {
    const taskList = document.getElementById("taskList") as HTMLUListElement;
    const filterValue = (document.getElementById("filter") as HTMLSelectElement).value;

    taskList.innerHTML = "";

    let filteredTasks = tasks.filter(task => {
        if (filterValue === "completed") return task.status === TaskStatus.Completed;
        if (filterValue === "pending") return task.status === TaskStatus.Pending;
        return true;
    });

    filteredTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = task.status === TaskStatus.Completed ? "completed" : "";
        li.innerHTML = `
            <span onclick="toggleTask(${index})">${task.text} (Due: ${task.dueDate || "No date"})</span>
            <button class="remove-btn" onclick="removeTask(${index})">Remove</button>
        `;
        taskList.appendChild(li);
    });
}
