// データの初期化（ローカルストレージから取得）
let data = JSON.parse(localStorage.getItem("studyData")) || [];
let subjects = JSON.parse(localStorage.getItem("studySubjects")) || ["数学", "英語", "国語"];

// 保存処理
function saveAll() {
  localStorage.setItem("studyData", JSON.stringify(data));
  localStorage.setItem("studySubjects", JSON.stringify(subjects));
}

// 科目の追加
function addNewSubject() {
  const input = document.getElementById("newSubjectName");
  const val = input.value.trim();
  if (!val || subjects.includes(val)) return;
  
  subjects.push(val);
  input.value = "";
  saveAll();
  render();
}

// 科目の削除
function deleteSubject(index) {
  if (confirm(`科目「${subjects[index]}」を削除しますか？`)) {
    subjects.splice(index, 1);
    saveAll();
    render();
  }
}

// 勉強ログの追加
function addStudy() {
  const subject = document.getElementById("subjectSelect").value;
  const time = parseInt(document.getElementById("time").value);

  if (!subject || !time) return;

  data.push({ subject, time, id: Date.now() });
  saveAll();

  if (typeof gtag === "function") {
    gtag("event", "add_study", { subject, time });
  }

  document.getElementById("time").value = "";
  render();
}

// 勉強ログの削除
function deleteLog(id) {
  data = data.filter(d => d.id !== id);
  saveAll();
  render();
}

// 画面描画
function render() {
  // 1. 科目セレクトボックスの更新
  const select = document.getElementById("subjectSelect");
  select.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join("");

  // 2. 科目管理リストの更新
  const sList = document.getElementById("subjectList");
  sList.innerHTML = subjects.map((s, i) => `
    <li>
      <span>${s}</span>
      <button class="del-btn" onclick="deleteSubject(${i})">削除</button>
    </li>
  `).join("");

  // 3. ログリストの更新
  const logList = document.getElementById("logList");
  logList.innerHTML = "";
  let total = 0;
  let summary = {};

  // 最新が上に来るように逆順で表示
  [...data].reverse().forEach(d => {
    total += d.time;
    summary[d.subject] = (summary[d.subject] || 0) + d.time;

    let li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${d.subject}</strong> <small style="color:#64748b">${d.time}分</small></span>
      <button class="del-btn" onclick="deleteLog(${d.id})">削除</button>
    `;
    logList.appendChild(li);
  });

  document.getElementById("total").textContent = `合計: ${total}分`;
  renderChart(summary);
}

let chart;
function renderChart(summary) {
  const ctx = document.getElementById("chart");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(summary),
      datasets: [{
        label: "累計時間（分）",
        data: Object.values(summary),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// 初回実行
render();
