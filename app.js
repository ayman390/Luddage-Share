
const $ = sel => document.querySelector(sel);
const app = $("#app");

function seedDemo(){
  if(localStorage.getItem("offers")) return;
  const demo=[
    {from:"DXB", to:"JED", flight:"SV553", date:new Date().toISOString().slice(0,10), weight:5},
    {from:"AUH", to:"CAI", flight:"EY653", date:new Date(Date.now()+86400000).toISOString().slice(0,10), weight:3},
    {from:"RUH", to:"DXB", flight:"FZ812", date:new Date(Date.now()+2*86400000).toISOString().slice(0,10), weight:4.5}
  ];
  localStorage.setItem("offers", JSON.stringify(demo));
}
seedDemo();

function user(){ return JSON.parse(localStorage.getItem("user")||"null"); }
function login(u){ localStorage.setItem("user", JSON.stringify(u)); }
function logout(){ localStorage.removeItem("user"); }

function route(view){
  window.history.replaceState({}, "", "#"+view);
  render(view);
}

function render(view){
  if(!view){ view = (location.hash||"#offers").slice(1); }
  const u = user();

  if(view==='login'){
    if(u){
      app.innerHTML = `
        <div class="card brand-chip">
          <img src="icons/logo.png" alt="logo">
          <div><b>${u.email}</b><div class="muted">Signed in</div></div>
        </div>
        <button class="btn" id="logoutBtn">Sign out</button>
      `;
      document.querySelector("#logoutBtn").onclick = ()=>{ logout(); route('offers'); };
      return;
    }
    app.innerHTML = `
      <div class="card">
        <div class="brand-chip"><img src="icons/logo.png"/><div><b>Welcome</b><div class="muted">Sign in to sync later</div></div></div>
        <label>Email</label><input id="email" inputmode="email" autocomplete="email" placeholder="you@email.com">
        <label>Password</label><input id="pass" type="password" placeholder="••••••••">
        <button class="btn" id="loginBtn">Sign in (demo)</button>
        <div class="muted" style="margin-top:8px">Demo only: credentials are stored locally on this device.</div>
      </div>
    `;
    document.querySelector("#loginBtn").onclick = ()=>{
      const email = document.querySelector("#email").value.trim();
      if(!email){ alert("Enter email"); return; }
      login({email});
      route('offers');
    };
    return;
  }

  if(view==='create'){
    app.innerHTML = `
      ${u ? `<div class="card">Hello, <b>${u.email}</b></div>` : ""}
      <div class="card"><b>Create</b></div>
      <label>From</label><input id="from" placeholder="DXB">
      <label>To</label><input id="to" placeholder="JED">
      <label>Flight No.</label><input id="flight" placeholder="SV553">
      <label>Date</label><input id="date" type="date">
      <label>Weight (kg)</label><input id="weight" type="number" min="1" step="0.5">
      <button class="btn" id="save">Save</button>
      <div class="muted">Demo only. Do not enter sensitive info.</div>
    `;
    document.querySelector("#save").onclick = () => {
      const item = {
        from: document.querySelector("#from").value || "DXB",
        to: document.querySelector("#to").value || "JED",
        flight: document.querySelector("#flight").value || "SV553",
        date: document.querySelector("#date").value || new Date().toISOString().slice(0,10),
        weight: document.querySelector("#weight").value || 3
      };
      const arr = JSON.parse(localStorage.getItem("offers")||"[]");
      arr.unshift(item);
      localStorage.setItem("offers", JSON.stringify(arr));
      route('offers');
    };
    return;
  }

  if(view==='offers'){
    const arr = JSON.parse(localStorage.getItem("offers")||"[]");
    app.innerHTML = `${u ? `<div class="card">Welcome back, <b>${u.email}</b> 👋</div>` : `<div class="card">You're browsing as guest. <button class="btn-link" onclick="route('login')">Sign in</button></div>`}`;
    if(!arr.length){
      app.innerHTML += "<div class='card'>No items yet. Add one from Create.</div>";
      return;
    }
    arr.forEach((o) => {
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `<div class="pill">${o.from}</div> → <div class="pill">${o.to}</div>
        <div class="muted">Flight ${o.flight} • ${o.date} • ${o.weight} kg</div>
        <div style="margin-top:8px"><button class="btn" onclick="alert('Matched (demo).')">Match</button></div>`;
      app.appendChild(el);
    });
    return;
  }

  if(view==='wallet'){
    app.innerHTML = `
      <div class="card"><b>Wallet</b> — demo UI</div>
      <label>Name on Card</label><input id="name" placeholder="Ayman">
      <label>Card Number</label><input id="card" placeholder="0000 0000 0000 0000">
      <div class="row">
        <div><label>CVV</label><input id="cvv" placeholder="123"></div>
        <div><label>Expiry (MM/YY)</label><input id="exp" placeholder="12/29"></div>
      </div>
      <div class="muted">Do NOT enter real card details.</div>
    `;
    return;
  }

  if(view==='agreement'){
    app.innerHTML = `
      <div class="card">
        <p>Generate a simple agreement preview and use iOS Share to save as PDF.</p>
        <button class="btn" onclick="genAgreement()">Generate Agreement</button>
      </div>
    `;
    return;
  }
}

function genAgreement(){
  const w = window.open("", "_blank");
  const html = `<html><head><title>Agreement</title></head><body>
  <h2>Luggage Share Agreement</h2>
  <p>Party A: ____________</p>
  <p>Party B: ____________</p>
  <p>Flight: ______ &nbsp; Date: ______ &nbsp; Weight: ______ kg</p>
  <p>Signatures:</p>
  <p>A: _______________________</p>
  <p>B: _______________________</p>
  </body></html>`;
  w.document.write(html);
  w.document.close();
}

window.addEventListener("hashchange", () => render());
window.addEventListener("load", () => render());
