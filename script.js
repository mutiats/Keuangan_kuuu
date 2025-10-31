// Elements
const form = document.getElementById("financeForm");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const transactionList = document.getElementById("transactionList");
const balanceEl = document.getElementById("balance");

// Transactions
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Save to localStorage
function saveTransactions(){
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Render Transactions
function renderTransactions(){
  transactionList.innerHTML = "";
  let balance = 0;
  let incomeTotal = 0;
  let expenseTotal = 0;

  transactions.forEach((t,index)=>{
    const div = document.createElement("div");
    div.classList.add("transactionCard", t.type);
    div.innerHTML = `
      <strong>${t.desc}</strong>
      <span>Rp${t.amount}</span>
      <button onclick="deleteTransaction(${index})">Hapus</button>
    `;
    transactionList.appendChild(div);

    // Drag effect
    div.addEventListener("dragstart", e=>{
      e.dataTransfer.setData("text/plain", index);
    });
    div.draggable = true;

    if(t.type==='income'){
      balance += parseInt(t.amount);
      incomeTotal += parseInt(t.amount);
    } else {
      balance -= parseInt(t.amount);
      expenseTotal += parseInt(t.amount);
    }
  });

  balanceEl.textContent = `Saldo: Rp${balance}`;
  renderChart(incomeTotal, expenseTotal);
  spawnParticles(); // Particle effect on render
}

// Add Transaction
form.addEventListener("submit", e=>{
  e.preventDefault();
  const desc = descInput.value;
  const amount = amountInput.value;
  const type = typeSelect.value;

  transactions.push({desc,amount,type});
  saveTransactions();
  renderTransactions();
  form.reset();
  playSound();
});

// Delete Transaction
function deleteTransaction(index){
  transactions.splice(index,1);
  saveTransactions();
  renderTransactions();
}

// Chart
let chart;
function renderChart(income, expense){
  const ctx = document.getElementById('chart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx,{
    type: 'doughnut',
    data:{
      labels:['Pemasukan','Pengeluaran'],
      datasets:[{
        data:[income,expense],
        backgroundColor:['#00ff7f','#ff4d4d'],
        borderColor:'#800000',
        borderWidth:2
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom'},
        tooltip:{enabled:true}
      }
    }
  });
}

// Simple prediction AI
function predictNext(){
  let income = transactions.filter(t=>t.type==='income').reduce((a,b)=>a+parseInt(b.amount),0);
  let expense = transactions.filter(t=>t.type==='expense').reduce((a,b)=>a+parseInt(b.amount),0);
  return Math.round((income-expense)*1.1);
}

// Particle effect
function spawnParticles(){
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const particles = [];
  for(let i=0;i<15;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*5+2,
      color: `rgba(255,77,77,${Math.random()})`,
      speedY: Math.random()*2+1
    });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y -= p.speedY;
      if(p.y < 0) p.y = canvas.height;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// Sound effect
function playSound(){
  const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime+0.1);
}

// Initial render
renderTransactions();
console.log("Prediksi saldo selanjutnya:", predictNext());
