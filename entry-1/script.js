// Edit this list to change your products. To use a real photo, set image: "photos/name.jpg"
const PRODUCTS = [
  { id: 1,  name: "Sungold Cherry Tomato",   cat: "veg",    price: 4.5,  note: "Sweet orange fruit, climbs a railing", image: "" },
  { id: 2,  name: "Genovese Basil",          cat: "herb",   price: 3.5,  note: "Fast in a sunny window", image: "" },
  { id: 3,  name: "Window Box Salad Mix",    cat: "veg",    price: 4,    note: "Cut and come again in 4 weeks", image: "" },
  { id: 4,  name: "Zinnia Confetti",         cat: "flower", price: 3.75, note: "Bright, bee-loved, easy", image: "" },
  { id: 5,  name: "Teddy Bear Sunflower",    cat: "flower", price: 3.5,  note: "Fluffy dwarf blooms for pots", image: "" },
  { id: 6,  name: "Sugar Snap Pea",          cat: "veg",    price: 3.75, note: "Plant in April, eat from the vine", image: "" },
  { id: 7,  name: "Slow-Bolt Cilantro",      cat: "herb",   price: 3.25, note: "Sow again in August", image: "" },
  { id: 8,  name: "Nasturtium Jewel",        cat: "flower", price: 3.5,  note: "Edible flowers and round leaves", image: "" },
  { id: 9,  name: "Fire Escape Chili",       cat: "veg",    price: 4.5,  note: "Compact plants, medium heat", image: "" },
  { id: 10, name: "Lavender Munstead",       cat: "herb",   price: 4.25, note: "Perennial, loves a south ledge", image: "" },
  { id: 11, name: "Bush Pickling Cucumber",  cat: "veg",    price: 3.75, note: "Small vines for big containers", image: "" },
  { id: 12, name: "Pollinator Meadow Mix",   cat: "flower", price: 5,    note: "Native wildflowers for the stoop", image: "" }
];

const $ = s => document.querySelector(s);
const money = n => "$" + n.toFixed(2);

/* ---------- shop ---------- */
let filter = "all";

function renderGrid() {
  $("#grid").innerHTML = PRODUCTS
    .filter(p => filter === "all" || p.cat === filter)
    .map(p => `
      <article class="item">
        <div class="ph">${p.image ? `<img src="${p.image}" alt="${p.name}">` : "Photo: " + p.name}</div>
        <h3>${p.name}</h3>
        <p class="meta">${p.note}</p>
        <div class="row">
          <span class="price">${money(p.price)}</span>
          <button class="add" type="button" data-add="${p.id}" aria-label="Add ${p.name} to basket">Add to basket</button>
        </div>
      </article>`).join("");
}

document.querySelector(".filters").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  filter = b.dataset.f;
  document.querySelectorAll(".filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
  renderGrid();
});

$("#grid").addEventListener("click", e => {
  const b = e.target.closest("[data-add]");
  if (!b) return;
  add(+b.dataset.add);
  b.textContent = "Added";
  setTimeout(() => (b.textContent = "Add to basket"), 900);
});

/* ---------- basket ---------- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem("tgs-cart") || "{}") || {}; } catch (e) { cart = {}; }

function save() { try { localStorage.setItem("tgs-cart", JSON.stringify(cart)); } catch (e) {} }
function add(id) { cart[id] = (cart[id] || 0) + 1; save(); renderCart(); }
function setQty(id, d) { cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; save(); renderCart(); }

function renderCart() {
  const ids = Object.keys(cart).filter(id => PRODUCTS.some(p => p.id == id));
  $("#count").textContent = ids.reduce((s, id) => s + cart[id], 0);
  if (!ids.length) {
    $("#cartBody").innerHTML = `<p class="empty">Your basket is empty. Pick a few packets to get started.</p>`;
    return;
  }
  let sub = 0;
  const lines = ids.map(id => {
    const p = PRODUCTS.find(x => x.id == id);
    const t = p.price * cart[id];
    sub += t;
    return `<li><span class="nm">${p.name}</span><span class="price">${money(t)}</span>
      <div class="qty">
        <button type="button" data-q="${id}" data-d="-1" aria-label="Remove one ${p.name}">−</button>
        <span>${cart[id]}</span>
        <button type="button" data-q="${id}" data-d="1" aria-label="Add one ${p.name}">+</button>
      </div></li>`;
  }).join("");
  const ship = sub >= 25 ? 0 : 6;
  $("#cartBody").innerHTML = `<ul class="lines">${lines}</ul>
    <div class="foot">
      <div class="tot"><span>Total</span><span>${money(sub + ship)}</span></div>
      <small>${ship ? "Shipping $6. Free over $25 or pick up in store." : "Free shipping applied."}</small>
      <button class="btn" type="button" id="checkout">Place order</button>
    </div>`;
}

$("#cartBody").addEventListener("click", e => {
  const q = e.target.closest("[data-q]");
  if (q) return setQty(q.dataset.q, +q.dataset.d);
  if (e.target.id === "checkout") {
    cart = {}; save(); renderCart();
    $("#cartBody").innerHTML = `<div class="done"><h3>Thank you!</h3><p>This is a demo checkout, so no payment was taken. Connect a payment service such as Stripe to take real orders.</p></div>`;
  }
});

function openCart(open) {
  $("#cart").classList.toggle("on", open);
  $("#veil").classList.toggle("on", open);
  $("#cart").setAttribute("aria-hidden", !open);
  if (open) renderCart();
}
$("#openCart").onclick = () => openCart(true);
$("#closeCart").onclick = $("#veil").onclick = () => openCart(false);
document.addEventListener("keydown", e => { if (e.key === "Escape") openCart(false); });

/* ---------- newsletter ---------- */
$("#news").addEventListener("submit", e => {
  e.preventDefault();
  $("#newsMsg").textContent = "Thanks! We’ll email you when it’s time to sow.";
  e.target.reset();
});

/* ---------- logo upload (only runs if the upload box exists) ---------- */
if ($("#logoSlot")) {
const slot = $("#logoSlot");
$("#logoFile").addEventListener("change", e => {
  const f = e.target.files[0];
  if (!f) return;
  const img = new Image();
  img.alt = "The Garden Store logo";
  img.src = URL.createObjectURL(f);
  slot.querySelector("label").style.display = "none";
  slot.querySelector("img")?.remove();
  slot.append(img);
  slot.classList.add("has");
  slot.style.borderStyle = "solid";
  $("#logoReset").style.display = "block";
});
$("#logoReset").onclick = () => {
  slot.querySelector("img")?.remove();
  slot.querySelector("label").style.display = "";
  slot.classList.remove("has");
  slot.style.borderStyle = "";
  $("#logoFile").value = "";
  $("#logoReset").style.display = "none";
};

}

renderGrid();
renderCart();