let examSubmitted = false;
window.questions = [];

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
      "https://script.google.com/macros/s/AKfycbwK2azAwS-_4zxRXbR1--6lJLR5iT8341QvWfJDJFsOV-s--7K-eoDZ5PqkZHyWf-x7/exec?action=questions"; // Replace with your Web App URL
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
    renderQuestions(questions);
  } catch (err) {
    alert("Unable to load questions: " + err);
    console.error(err);
  }
}

// ===== RENDER QUESTIONS =====
function renderQuestions(questions) {
  const box = document.getElementById("questions");
  box.innerHTML = "";

  questions.forEach((x, i) => {
    box.innerHTML += `<p>${i + 1}. ${x.q}</p>`;
    x.o.forEach((opt, j) => {
      box.innerHTML += `<label>
        <input type="radio" name="q${i}" value="${j}"> ${opt}
      </label><br>`;
    });
  });

  window.questions = questions;
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
    "https://script.google.com/macros/s/AKfycbwK2azAwS-_4zxRXbR1--6lJLR5iT8341QvWfJDJFsOV-s--7K-eoDZ5PqkZHyWf-x7/exec"; // Replace with Web App URL
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
