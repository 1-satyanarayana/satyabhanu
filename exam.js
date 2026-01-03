let examSubmitted = false;
window.questions = [];
let currentQuestion = 0;

// ===== TIMER =====
let time = 600; // 10 minutes
let timer = setInterval(() => {
  time--;
  const minutes = Math.floor(time / 60);
  const seconds = (time % 60).toString().padStart(2, "0");
  document.getElementById(
    "timer"
  ).innerText = `⏱ Time Left: ${minutes}:${seconds}`;
  if (time <= 0) {
    clearInterval(timer);
    submitExam();
  }
}, 1000);

// ===== AUTO SUBMIT ON TAB SWITCH =====
document.addEventListener("visibilitychange", () => {
  if (document.hidden) submitExam();
});

// ===== LOAD QUESTIONS =====
async function loadQuestions() {
  try {
    const url =
      "https://script.google.com/macros/s/AKfycbwK2azAwS-_4zxRXbR1--6lJLR5iT8341QvWfJDJFsOV-s--7K-eoDZ5PqkZHyWf-x7/exec?action=questions";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      alert("No questions found in the sheet!");
      return;
    }

    const questions = data.map((row) => ({
      q: row[0],
      o: [row[1], row[2], row[3], row[4]],
      a: +row[5],
    }));

    questions.sort(() => Math.random() - 0.5);
    window.questions = questions;
    renderQuestion(currentQuestion);
  } catch (err) {
    alert("Unable to load questions: " + err);
    console.error(err);
  }
}

// ===== RENDER ONE QUESTION =====
function renderQuestion(index) {
  const box = document.getElementById("questions");
  const q = window.questions[index];
  box.innerHTML = `
    <p style="user-select:none">${index + 1}. ${q.q}</p>
    ${q.o
      .map(
        (opt, j) =>
          `<label style="user-select:none">
             <input type="radio" name="q${index}" value="${j}"> ${opt}
           </label><br>`
      )
      .join("")}
    <button id="nextBtn">${
      index === window.questions.length - 1 ? "Submit" : "Next"
    }</button>
  `;

  // Disable copy/paste
  box.oncopy = box.oncut = box.onpaste = (e) => e.preventDefault();

  document.getElementById("nextBtn").onclick = () => {
    currentQuestion++;
    if (currentQuestion >= window.questions.length) {
      submitExam();
    } else {
      renderQuestion(currentQuestion);
    }
  };
}

// ===== SUBMIT EXAM =====
function submitExam() {
  if (examSubmitted) return;
  examSubmitted = true;

  let score = 0;
  window.questions.forEach((x, i) => {
    const ans = document.querySelector(`input[name="q${i}"]:checked`);
    if (ans && +ans.value === x.a) score++;
  });

  localStorage.setItem("score", score);

  const url =
    "https://script.google.com/macros/s/AKfycbwK2azAwS-_4zxRXbR1--6lJLR5iT8341QvWfJDJFsOV-s--7K-eoDZ5PqkZHyWf-x7/exec";
  fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: localStorage.getItem("name"),
      roll: localStorage.getItem("roll"),
      phone: localStorage.getItem("phone"),
      score: score,
    }),
  }).catch((err) => console.error("Failed to submit exam:", err));

  setTimeout(() => (window.location = "certificate.html"), 800);
}

// ===== LOAD QUESTIONS ON PAGE LOAD =====
window.onload = loadQuestions;
