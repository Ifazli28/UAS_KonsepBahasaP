// Elemen DOM
const timerDisplay = document.querySelector('.timer-display');
const startButton = document.getElementById('startTimer');
const resetButton = document.getElementById('resetTimer');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const addTodoButton = document.getElementById('addTodo');
const studyTimeInput = document.getElementById('studyTime');  
const breakTimeInput = document.getElementById('breakTime');  

// Variabel timer
let timeLeft;
let timerInterval = null;
let isStudyMode = true;
let studyDuration = 25; 
let breakDuration = 5;  


function initTimer() {
    studyDuration = parseInt(studyTimeInput.value) || 25;
    breakDuration = parseInt(breakTimeInput.value) || 5;
    
    timeLeft = isStudyMode ? studyDuration * 60 : breakDuration * 60;
    updateTimerDisplay();
}

// Start dan Pause
function toggleTimer() {
    if (timerInterval === null) {
        studyDuration = parseInt(studyTimeInput.value) || studyDuration;
        breakDuration = parseInt(breakTimeInput.value) || breakDuration;
        
        // Start timer
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                // Timer selesai
                clearInterval(timerInterval);
                timerInterval = null;
                isStudyMode = !isStudyMode;
                timeLeft = isStudyMode ? studyDuration * 60 : breakDuration * 60;
                playNotification();
                updateTimerDisplay();
                toggleTimer(); 
            }
        }, 1000);
        
        startButton.textContent = 'Pause';
        timerDisplay.classList.add('active');
    } else {
        // Pause timer
        clearInterval(timerInterval);
        timerInterval = null;
        startButton.textContent = 'Start';
        timerDisplay.classList.remove('active');
    }
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isStudyMode = true;
    initTimer(); 
    startButton.textContent = 'Start';
    timerDisplay.classList.remove('active');
}

// Update timer 
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    document.getElementById('timerStatus').textContent = 
        ` ${isStudyMode ? 'Waktunya Belajar' : 'Waktunya Istirahat'}`;
}


function validateTimeInput(input) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
        value = 1;
    } else if (value > 120) { 
        value = 120;
    }
    input.value = value;
    return value;
}

// notifikasi
function playNotification() {
    new Audio('https://cdn.freesound.org/previews/123/123714_2193796-lq.mp3')
        .play()
        .catch(err => console.log('Sound play error:', err));
}

// Todo List 
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// tambah
function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        todos.push({
            id: Date.now(),
            text: text,
            completed: false
        });
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
}

// status
function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? {...todo, completed: !todo.completed} : todo
    );
    saveTodos();
    renderTodos();
}

// Delete 
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Save todos ke localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Render todo list
function renderTodos() {
    todoList.innerHTML = '';
    todos.sort((a, b) => b.id - a.id).forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <button class="btn complete-btn" onclick="toggleTodo(${todo.id})">✓</button>
            <span class="todo-item-text">${todo.text}</span>
            <button class="btn delete-btn" onclick="deleteTodo(${todo.id})">×</button>
        `;
        todoList.appendChild(li);
    });
}

// Event Listeners
startButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
addTodoButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTodo();
});

// Add input validation listeners
studyTimeInput.addEventListener('change', () => {
    studyDuration = validateTimeInput(studyTimeInput);
    if (!timerInterval && isStudyMode) {
        timeLeft = studyDuration * 60;
        updateTimerDisplay();
    }
});

breakTimeInput.addEventListener('change', () => {
    breakDuration = validateTimeInput(breakTimeInput);
    if (!timerInterval && !isStudyMode) {
        timeLeft = breakDuration * 60;
        updateTimerDisplay();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Set default values for inputs
    studyTimeInput.value = studyDuration;
    breakTimeInput.value = breakDuration;
    initTimer();
    renderTodos();
});