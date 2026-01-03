let examSubmitted = false;
let currentQuestion = 0;
let questions = [];
let answers = {};
let warned = false;

/* ===== TIMER (10 minutes) ===== */
let time = 600;

const timer = setInterval(() => {
  time--;
  const min = Math.floor(time / 60);
  const sec = String(time % 60).padStart(2, "0");
  document.getElementById("timer").innerText = `⏱ Time Left: ${min}:${sec}`;

  if (time <= 0) {
    clearInterval(timer);
    submitExam();
  }
}, 1000);

/* ===== TAB SWITCH WARNING ===== */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !examSubmitted) {
    if (!warned) {
      warned = true;
      alert("⚠ Warning: Do not leave the exam tab!");
    } else {
      submitExam();
    }
  }
});

/* ===== LOAD QUESTIONS ===== */
async function loadQuestions() {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbwK2azAwS-_4zxRXbR1--6lJLR5iT8341QvWfJDJFsOV-s--7K-eoDZ5PqkZHyWf-x7/exec?action=questions"
  );
  const data = await res.json();

  questions = data.map(row => ({
    q: row[0],
    o: [row[1], row[2], row[3], row[4]],
    a: +row[5]
  })).sort(() => Math.random() - 0.5);

  renderQuestion();
  updateProgress();
}

/* ===== RENDER ===== */
function renderQuestion() {
  const q = questions[currentQuestion];
  const box = document.getElementById("questions");

  box.innerHTML = `
    <div class="question-card">
      <p>${currentQuestion + 1}. ${q.q}</p>
      ${q.o.map((opt, i) => `
        <label>
          <input type="radio" name="q"
            value="${i}"
            ${answers[currentQuestion] === i ? "checked" : ""}
            onchange="saveAnswer(${i})">
          <span>${opt}</span>
        </label>
      `).join("")}
      <button onclick="nextQuestion()">
        ${currentQuestion === questions.length - 1 ? "Submit" : "Next"}
      </button>
    </div>
  `;
}

/* ===== SAVE ANSWER ===== */
function saveAnswer(val) {
  answers[currentQuestion] = val;
  updateProgress();
}

/* ===== NEXT ===== */
function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    submitExam();
  }
}

/* ===== PROGRESS ===== */
function updateProgress() {
  const percent = (Object.keys(answers).length / questions.length) * 100;
  document.getElementById("progressFill").style.width = percent + "%";
}

/* ===== SUBMIT ===== */
function submitExam() {
  if (examSubmitted) return;
  examSubmitted = true;

  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.a) score++;
  });

  localStorage.setItem("score", score);

  fetch(
    "https://script.google.com/macros/s/AKfycbwK2azAwS-_4zxRXbR1--6lJLR5iT8341QvWfJDJFsOV-s--7K-eoDZ5PqkZHyWf-x7/exec",
    {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        name: localStorage.getItem("name"),
        roll: localStorage.getItem("roll"),
        phone: localStorage.getItem("phone"),
        score
      })
    }
  );

  setTimeout(() => {
    window.location = "certificate.html";
  }, 800);
}

window.onload = loadQuestions;
