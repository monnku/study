let data = JSON.parse(localStorage.getItem("studyData")) || [];

function save() {
  localStorage.setItem("studyData", JSON.stringify(data));
}

function addStudy() {
  let subject = document.getElementById("subject").value;
  let time = parseInt(document.getElementById("time").value);

  if (!subject || !time) return;

  data.push({ subject, time });
  save();

  if (typeof gtag === "function") {
    gtag("event", "add_study", {
      subject: subject,
      time: time
    });
  }

  render();
}

function render() {
  let list = document.getElementById("list");
  list.innerHTML = "";

  let total = 0;
  let summary = {};

  data.forEach(d => {
    total += d.time;

    if (!summary[d.subject]) summary[d.subject] = 0;
    summary[d.subject] += d.time;

    let li = document.createElement("li");
    li.textContent = d.subject + " - " + d.time + "分";
    list.appendChild(li);
  });

  document.getElementById("total").textContent = total + "分";

  renderChart(summary);
}

let chart;

function renderChart(summary) {
  let ctx = document.getElementById("chart");

  let labels = Object.keys(summary);
  let values = Object.values(summary);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "勉強時間（分）",
        data: values
      }]
    }
  });
}

render();
