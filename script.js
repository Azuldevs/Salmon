// ★スプレッドシート公開URLを設定
const SHEET_URL = "https://docs.google.com/spreadsheets/d/【スプレッドシートID】/gviz/tq?tqx=out:json";

let questions = [];
let currentIndex = 0;
let score = 0;
let filteredQuestions = [];

// DOM要素
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const questionText = document.getElementById("question-text");
const quizImage = document.getElementById("quiz-image");
const choicesDiv = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const difficultySelect = document.getElementById("difficulty-select");
const subjectSelect = document.getElementById("subject-select");
const difficultyBadge = document.getElementById("difficulty-badge");

// 難易度色マップ
const difficultyColors = {
  "Easy": "bg-success text-white",   // 緑
  "Normal": "bg-warning text-dark",  // 黄
  "Hard": "bg-danger text-white",    // 赤
  "Insane": "bg-dark text-white"     // 黒
};

async function loadQuestions() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  
  questions = json.table.rows.map(r => ({
    image: r.c[0]?.v || "",
    question: r.c[1]?.v || "",
    choices: [r.c[2]?.v, r.c[3]?.v, r.c[4]?.v, r.c[5]?.v],
    answer: r.c[6]?.v,
    difficulty: r.c[7]?.v || "Easy",   // デフォルトをEasyに
    subject: r.c[8]?.v || "未分類"
  }));

  // 教科リストと難易度を更新
  updateSubjectOptions();
  updateDifficultyOptions();
}

function updateSubjectOptions() {
  const subjects = ["すべて", ...new Set(questions.map(q => q.subject))];
  subjectSelect.innerHTML = "";
  subjects.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s === "すべて" ? "all" : s;
    opt.textContent = s;
    subjectSelect.appendChild(opt);
  });
}

function updateDifficultyOptions() {
  // 難易度は固定（Easy / Normal / Hard / Insane）
  const levels = ["すべて", "Easy", "Normal", "Hard", "Insane"];
  difficultySelect.innerHTML = "";
  levels.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d === "すべて" ? "all" : d;
    opt.textContent = d;
    difficultySelect.appendChild(opt);
  });
}

function startQuiz() {
  const difficulty = difficultySelect.value;
  const subject = subjectSelect.value;

  filteredQuestions = questions.filter(q =>
    (difficulty === "all" || q.difficulty === difficulty) &&
    (subject === "all" || q.subject === subject)
  );

  filteredQuestions = shuffle(filteredQuestions).slice(0, 10);
  currentIndex = 0;
  score = 0;

  homeScreen.classList.add("d-none");
  quizScreen.classList.remove("d-none");
  resultScreen.classList.add("d-none");

  showQuestion();
}

function showQuestion() {
  const q = filteredQuestions[currentIndex];
  questionText.textContent = q.question;
  quizImage.src = q.image;
  choicesDiv.innerHTML = "";

  // 難易度バッジ更新
  difficultyBadge.textContent = q.difficulty;
  difficultyBadge.className = "badge " + (difficultyColors[q.difficulty] || "bg-secondary");

  q.choices.forEach(choice => {
    if (choice) {
      const btn = document.createElement("button");
      btn.className = "list-group-item list-group-item-action";
      btn.textContent = choice;
      btn.onclick = () => checkAnswer(choice, q.answer);
      choicesDiv.appendChild(btn);
    }
  });

  feedback.textContent = "";
  nextBtn.classList.add("d-none");
}

function checkAnswer(choice, answer) {
  if (choice === answer) {
    feedback.textContent = "正解！";
    feedback.className = "text-success fw-bold";
    score++;
  } else {
    feedback.textContent = `不正解… 正解は ${answer}`;
    feedback.className = "text-danger fw-bold";
  }
  nextBtn.classList.remove("d-none");
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < filteredQuestions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  quizScreen.classList.add("d-none");
  resultScreen.classList.remove("d-none");
  scoreText.textContent = `あなたのスコア: ${score} / ${filteredQuestions.length}`;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// イベント
startBtn.onclick = startQuiz;
nextBtn.onclick = nextQuestion;
retryBtn.onclick = () => {
  homeScreen.classList.remove("d-none");
  quizScreen.classList.add("d-none");
  resultScreen.classList.add("d-none");
};

// 最初にロード
loadQuestions();
