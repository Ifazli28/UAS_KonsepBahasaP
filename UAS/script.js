class PomodoroTimer {
    constructor() {
        this.workTime = 25;
        this.breakTime = 5;
        this.timeLeft = this.workTime * 60;
        this.isRunning = false;
        this.isWorkTime = true;
        this.timer = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timer = setInterval(() => this.tick(), 1000);
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Jeda';
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
            startBtn.innerHTML = '<i class="fas fa-play"></i> Lanjutkan';
        }
    }

    reset() {
        this.pause();
        this.timeLeft = this.workTime * 60;
        this.isWorkTime = true;
        this.updateDisplay();
        startBtn.innerHTML = '<i class="fas fa-play"></i> Mulai';
        this.updateStatus();
    }

    tick() {
        this.timeLeft--;
        if (this.timeLeft < 0) {
            this.switchMode();
        }
        this.updateDisplay();
    }

    switchMode() {
        this.isWorkTime = !this.isWorkTime;
        this.timeLeft = (this.isWorkTime ? this.workTime : this.breakTime) * 60;
        this.updateStatus();
        this.playNotification();
        
        // Tampilkan notifikasi desktop
        if (Notification.permission === "granted") {
            new Notification("Pengatur Waktu", {
                icon: "https://cdn-icons-png.flaticon.com/512/3589/3589030.png",
                body: `Waktunya ${this.isWorkTime ? 'belajar' : 'istirahat'}!`,
            });
        }
    }

    playNotification() {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update judul halaman
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Asisten Belajar`;
    }

    updateStatus() {
        const statusEl = document.getElementById('timerStatus');
        statusEl.innerHTML = `<i class="fas fa-${this.isWorkTime ? 'book-reader' : 'coffee'}"></i> Status: Waktu ${this.isWorkTime ? 'Belajar' : 'Istirahat'}`;
    }

    updateTimes() {
        this.workTime = parseInt(workTimeInput.value);
        this.breakTime = parseInt(breakTimeInput.value);
        if (!this.isRunning) {
            this.timeLeft = this.workTime * 60;
            this.updateDisplay();
        }
    }
}

class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.render();
        this.setupDragAndDrop();
    }

    add(text) {
        if (text.trim()) {
            this.todos.push({
                id: Date.now(),
                text,
                completed: false,
                createdAt: new Date().toISOString()
            });
            this.save();
            this.render();
        }
    }

    toggle(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            // Animasi saat menyelesaikan tugas
            const element = document.querySelector(`[data-id="${id}"]`);
            element.classList.add('fade');
            setTimeout(() => {
                this.save();
                this.render();
            }, 300);
        }
    }

    delete(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        element.classList.add('slide-out');
        setTimeout(() => {
            this.todos = this.todos.filter(t => t.id !== id);
            this.save();
            this.render();
        }, 300);
    }

    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    setupDragAndDrop() {
        const todoList = document.getElementById('todoList');
        
        todoList.addEventListener('dragstart', (e) => {
            e.target.classList.add('dragging');
        });

        todoList.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        todoList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(todoList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                todoList.appendChild(draggable);
            } else {
                todoList.insertBefore(draggable, afterElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    render() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';
        
        this.todos
            .sort((a, b) => a.completed - b.completed)
            .forEach(todo => {
                const item = document.createElement('div');
                item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                item.setAttribute('data-id', todo.id);
                item.draggable = true;
                
                item.innerHTML = `
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <span>${todo.text}</span>
                    <span class="todo-date">${new Date(todo.createdAt).toLocaleDateString()}</span>
                    <i class="fas fa-trash delete-btn"></i>
                `;

                item.querySelector('input').addEventListener('change', () => this.toggle(todo.id));
                item.querySelector('.delete-btn').addEventListener('click', () => this.delete(todo.id));
                
                todoList.appendChild(item);
            });
    }
}

// Inisialisasi
const pomodoro = new PomodoroTimer();
const todos = new TodoList();

// DOM Elements
const timer = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const spotifyLoginBtn = document.getElementById('spotifyLoginBtn');

// Event Listeners
startBtn.addEventListener('click', () => {
    if (pomodoro.isRunning) {
        pomodoro.pause();
    } else {
        pomodoro.start();
    }
});

resetBtn.addEventListener('click', () => pomodoro.reset());

workTimeInput.addEventListener('change', () => pomodoro.updateTimes());
breakTimeInput.addEventListener('change', () => pomodoro.updateTimes());

addTodoBtn.addEventListener('click', () => {
    todos.add(todoInput.value);
    todoInput.value = '';
});

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        todos.add(todoInput.value);
        todoInput.value = '';
    }
});

// Request notification permission
if (Notification.permission === 'default') {
    Notification.requestPermission();
}



// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                if (pomodoro.isRunning) {
                    pomodoro.pause();
                } else {
                    pomodoro.start();
                }
                break;
            case 'r':
                e.preventDefault();
                pomodoro.reset();
                break;
        }
    }
});