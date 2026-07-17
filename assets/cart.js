/* Coral & Cord — shared catalog + cart drawer. Include once per page. */
(function(){
"use strict";
var ROOT=(function(){try{var sc=document.currentScript||document.querySelector('script[src*="cart.js"]');return sc.src.replace(/assets\/cart\.js.*$/,"");}catch(e){return "";}})();

/* ---------- Catalog ---------- */
var COLLECTIONS={
  ribbonreef:{key:"rr",name:"Ribbon Reef",accent:"#2E7D8D"},
  bluewater:{key:"bw",name:"Bluewater",accent:"#123F56"},
  tropictide:{key:"tt",name:"Tropic Tide",accent:"#65C9D6"},
  sunsetcurrent:{key:"sc",name:"Sunset Current",accent:"#E86F51"},
  coralgarden:{key:"cg",name:"Coral Garden",accent:"#C7D8D5"},
  reeftopo:{key:"rt",name:"Reef Topography",accent:"#0F2B46"},
  mangrove:{key:"mg",name:"Mangrove Roots",accent:"#5C6B3C"},
  electricreef:{key:"er",name:"Electric Reef",accent:"#B0447E"}
};
var TYPES={
  shirt:{label:"Long Sleeve Shirt",cat:"Fishing Shirts",price:79.95,catKey:"shirts"},
  hoodie:{label:"Hooded Shirt",cat:"Fishing Shirts",price:89.95,catKey:"hoodies"},
  shorts:{label:"Boardshorts",cat:"Shorts",price:69.95,catKey:"shorts"},
  buff:{label:"Performance Buff",cat:"Buffs",price:34.95,catKey:"buffs"}
};
var PATTERN_IMG={reeftopo:ROOT+"assets/pat_topo.jpg",mangrove:ROOT+"assets/pat_mangrove.jpg"};
var CATALOG={};
Object.keys(COLLECTIONS).forEach(function(slug){
  var c=COLLECTIONS[slug];
  Object.keys(TYPES).forEach(function(t){
    var T=TYPES[t], id=c.key+"-"+t;
    var imgs;
    if(t==="shirt"){ imgs=[ROOT+"assets/"+slug+"-front.png",ROOT+"assets/"+slug+"-back.png"]; }
    else { imgs=[ROOT+"assets/"+slug+"-"+t+".png"]; }
    if(PATTERN_IMG[slug]) imgs.push(PATTERN_IMG[slug]);
    CATALOG[id]={
      id:id, collection:c.name, slug:slug, type:t,
      name:c.name, sub:T.label, cat:T.cat, catKey:T.catKey,
      price:T.price, accent:c.accent,
      img:imgs[0], imgs:imgs,
      badge:(id==="rt-shirt")?"NEW":(id==="rr-shirt")?"BEST SELLER":null
    };
  });
});

/* ---------- Cart state ---------- */
var KEY="cc_cart_v1", FREE_SHIP=150, mem={};
function load(){ try{ var r=localStorage.getItem(KEY); return r?JSON.parse(r):{} }catch(e){ return mem } }
function save(c){ try{ localStorage.setItem(KEY,JSON.stringify(c)) }catch(e){ mem=c } }
var cart=load();
/* prune unknown ids from older versions */
Object.keys(cart).forEach(function(k){ if(!CATALOG[k.split("|")[0]]) delete cart[k]; });

function parse(idq){ var p=idq.split("|"); return {base:p[0], size:p[1]||null}; }
function fmt(n){ return "$"+n.toFixed(2); }
function totals(){
  var qty=0,sub=0;
  Object.keys(cart).forEach(function(k){ var b=parse(k).base; qty+=cart[k]; sub+=cart[k]*CATALOG[b].price; });
  return {qty:qty,sub:sub};
}

/* ---------- Drawer styles ---------- */
var css=""
+".cart-overlay{position:fixed;inset:0;background:rgba(15,43,70,.45);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .4s cubic-bezier(.22,.61,.36,1);z-index:190}"
+".cart-overlay.open{opacity:1;pointer-events:auto}"
+".cart-drawer{position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);background:#F8F8F6;z-index:200;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .5s cubic-bezier(.22,.61,.36,1);box-shadow:-30px 0 80px -20px rgba(15,43,70,.35);color:#16303f;font-family:'Manrope',sans-serif}"
+".cart-drawer.open{transform:none}"
+".cart-head{display:flex;align-items:center;justify-content:space-between;padding:22px 26px;border-bottom:1px solid rgba(15,43,70,.12)}"
+".cart-head h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;font-weight:600;margin:0}"
+".cart-qty-label{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:#5c6b73;margin-left:10px;font-weight:600}"
+".cart-close{background:none;border:none;cursor:pointer;color:#0F2B46;padding:6px;display:flex}"
+".cart-items{flex:1;overflow-y:auto;padding:10px 26px}"
+".cart-empty{text-align:center;color:#5c6b73;padding:60px 20px;font-size:.92rem;line-height:1.7}"
+".cart-empty svg{margin:0 auto 16px;display:block;color:#C7D8D5}"
+".cart-item{display:grid;grid-template-columns:76px 1fr auto;gap:16px;padding:18px 0;border-bottom:1px solid rgba(15,43,70,.12);align-items:center}"
+".cart-item-img{width:76px;height:95px;background:#fff;border-radius:10px;border:1px solid rgba(15,43,70,.12);overflow:hidden}"
+".cart-item-img img{width:100%;height:100%;object-fit:contain;padding:8%;box-sizing:border-box;display:block}"
+".cart-item-name{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.05rem;font-weight:600;line-height:1.15}"
+".cart-item-price{font-size:.8rem;color:#5c6b73;margin-top:3px}"
+".qty-row{display:flex;align-items:center;gap:10px;margin-top:10px}"
+".qty-btn{width:26px;height:26px;border-radius:50%;border:1.5px solid rgba(15,43,70,.2);background:none;cursor:pointer;color:#0F2B46;font-size:.9rem;line-height:1;display:flex;align-items:center;justify-content:center;transition:border-color .25s}"
+".qty-btn:hover{border-color:#0F2B46}"
+".qty-val{font-size:.85rem;font-weight:600;min-width:18px;text-align:center}"
+".cart-item-remove{background:none;border:none;cursor:pointer;color:#5c6b73;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;padding:4px;transition:color .25s}"
+".cart-item-remove:hover{color:#E86F51}"
+".cart-item-line{font-weight:600;color:#0F2B46;font-size:.92rem;justify-self:end;align-self:start;margin-top:4px}"
+".cart-foot{border-top:1px solid rgba(15,43,70,.12);padding:20px 26px 26px;background:#F4EFEA}"
+".ship-msg{font-size:.74rem;color:#5c6b73;margin-bottom:8px}"
+".ship-msg b{color:#0F2B46}"
+".ship-track{height:5px;background:rgba(15,43,70,.12);border-radius:4px;overflow:hidden;margin-bottom:16px}"
+".ship-fill{height:100%;background:linear-gradient(90deg,#2E7D8D,#65C9D6);border-radius:4px;width:0;transition:width .5s}"
+".ship-fill.free{background:linear-gradient(90deg,#E86F51,#f0906f)}"
+".cart-subtotal{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}"
+".cart-subtotal .lbl{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#0F2B46}"
+".cart-subtotal .amt{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.7rem;font-weight:600;color:#0F2B46}"
+".cart-note{font-size:.7rem;color:#5c6b73;margin-bottom:14px}"
+".checkout-btn{width:100%;display:inline-flex;align-items:center;justify-content:center;height:48px;border-radius:40px;background:#0F2B46;color:#F8F8F6;border:none;cursor:pointer;font-family:'Manrope',sans-serif;font-size:.74rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;transition:background .3s}"
+".checkout-btn:hover{background:#E86F51}"
+"@media(max-width:480px){.cart-drawer{width:100vw}}";

/* ---------- Drawer DOM ---------- */
function inject(){
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  var wrap=document.createElement("div");
  wrap.innerHTML=''
  +'<div class="cart-overlay" id="cartOverlay"></div>'
  +'<aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-label="Shopping cart">'
  +'<div class="cart-head"><h3>Your Cart<span class="cart-qty-label" id="cartQtyLabel"></span></h3>'
  +'<button class="cart-close" id="cartClose" aria-label="Close cart"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg></button></div>'
  +'<div class="cart-items" id="cartItems"></div>'
  +'<div class="cart-foot"><div class="ship-msg" id="shipMsg"></div><div class="ship-track"><div class="ship-fill" id="shipFill"></div></div>'
  +'<div class="cart-subtotal"><span class="lbl">Subtotal</span><span class="amt" id="cartSubtotal">$0.00</span></div>'
  +'<div class="cart-note">Shipping and taxes calculated at checkout.</div>'
  +'<button class="checkout-btn" id="checkoutBtn">Checkout</button></div></aside>';
  while(wrap.firstChild) document.body.appendChild(wrap.firstChild);
}

var drawer,overlay,itemsEl,subEl,qtyLabel,shipMsg,shipFill;
function render(){
  var t=totals();
  document.querySelectorAll(".cart-count,#cartCount").forEach(function(el){ el.textContent=t.qty; });
  qtyLabel.textContent=t.qty? "("+t.qty+" item"+(t.qty>1?"s":"")+")" : "";
  subEl.textContent=fmt(t.sub);
  if(t.qty===0){
    itemsEl.innerHTML='<div class="cart-empty"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 8h12l-1 12H7L6 8z" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke-linecap="round"/></svg>Your cart is empty.<br>Time to find your reef.</div>';
  } else {
    itemsEl.innerHTML=Object.keys(cart).map(function(k){
      var pi=parse(k), p=CATALOG[pi.base], q=cart[k];
      var nm=p.name+" "+p.sub+(pi.size?(" · "+pi.size):"");
      return '<div class="cart-item">'
        +'<div class="cart-item-img"><img src="'+p.img+'" alt="'+nm+'"></div>'
        +'<div><div class="cart-item-name">'+nm+'</div><div class="cart-item-price">'+fmt(p.price)+' AUD</div>'
        +'<div class="qty-row"><button class="qty-btn" data-dec="'+k+'" aria-label="Decrease quantity">−</button>'
        +'<span class="qty-val">'+q+'</span>'
        +'<button class="qty-btn" data-inc="'+k+'" aria-label="Increase quantity">+</button>'
        +'<button class="cart-item-remove" data-remove="'+k+'">Remove</button></div></div>'
        +'<div class="cart-item-line">'+fmt(p.price*q)+'</div></div>';
    }).join("");
  }
  var pct=Math.min(100,(t.sub/FREE_SHIP)*100);
  shipFill.style.width=pct+"%";
  shipFill.classList.toggle("free",t.sub>=FREE_SHIP);
  shipMsg.innerHTML = t.sub>=FREE_SHIP
    ? "<b>You\u2019ve unlocked free shipping!</b>"
    : "You\u2019re <b>"+fmt(FREE_SHIP-t.sub)+"</b> away from free Australia-wide shipping.";
  save(cart);
}
function openCart(){ drawer.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow="hidden"; }
function closeCart(){ drawer.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow=""; }
function add(idq,openIt){ cart[idq]=(cart[idq]||0)+1; render(); if(openIt!==false) openCart(); }

function init(){
  inject();
  drawer=document.getElementById("cartDrawer");
  overlay=document.getElementById("cartOverlay");
  itemsEl=document.getElementById("cartItems");
  subEl=document.getElementById("cartSubtotal");
  qtyLabel=document.getElementById("cartQtyLabel");
  shipMsg=document.getElementById("shipMsg");
  shipFill=document.getElementById("shipFill");
  document.querySelectorAll("#cartBtn,[data-cart-open]").forEach(function(b){ b.addEventListener("click",openCart); });
  document.getElementById("cartClose").addEventListener("click",closeCart);
  overlay.addEventListener("click",closeCart);
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeCart(); });
  document.addEventListener("click",function(e){
    var el;
    if((el=e.target.closest("[data-add]"))){
      add(el.getAttribute("data-add"));
      el.classList.add("added"); var orig=el.getAttribute("data-label")||"Add to Cart";
      el.textContent="Added ✓";
      setTimeout(function(){ el.classList.remove("added"); el.textContent=orig; },1200);
    } else if((el=e.target.closest("[data-inc]"))){
      var k1=el.getAttribute("data-inc"); cart[k1]++; render();
    } else if((el=e.target.closest("[data-dec]"))){
      var k2=el.getAttribute("data-dec"); cart[k2]--; if(cart[k2]<=0) delete cart[k2]; render();
    } else if((el=e.target.closest("[data-remove]"))){
      delete cart[el.getAttribute("data-remove")]; render();
    }
  });
  document.getElementById("checkoutBtn").addEventListener("click",function(){
    var b=this; b.textContent="Checkout coming soon";
    setTimeout(function(){ b.textContent="Checkout"; },1600);
  });
  render();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();

window.CC={CATALOG:CATALOG,COLLECTIONS:COLLECTIONS,TYPES:TYPES,add:add,open:function(){openCart()},fmt:fmt};
})();
