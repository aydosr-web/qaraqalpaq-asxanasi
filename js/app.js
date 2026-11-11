(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = n => `${Number(n || 0).toLocaleString('ru-RU')} so'm`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cfg = window.CFG || {};
  const hasConfig = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !/SIZIŃ|YOUR_|CHANGE_ME|placeholder/i.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY);
  const sb = hasConfig && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const fallback = [
    {id:1,category_id:1,name:'Qaraqalpaqsha Besbarmaq',description:'Jumsaq jılqı góshi, juqa qamır hám sorpa menen.',price:85000,available:true},
    {id:2,category_id:1,name:'Toy Ashı (Shopan sha)',description:'Gúrish, qoy góshi, sarı sábiz, meyiz hám bódene máyegi.',price:62000,available:true},
    {id:3,category_id:1,name:'Tandır Samsa (Góshli)',description:'Juqa qatlama qamır, tandırda pisirilgen.',price:18000,available:true},
    {id:4,category_id:2,name:'Qoy Góshi Shashliǵı',description:'Kómirde pisirilgen jumsaq qoy góshi.',price:38000,available:true},
    {id:5,category_id:2,name:'Qoy góshinen Lulya',description:'Tandır nan hám piyaz benen.',price:48000,available:true},
    {id:6,category_id:3,name:'Ashshı-Dushshı salatı',description:'Taza pomidor, tatlı piyaz, rayxan.',price:20000,available:true},
    {id:7,category_id:4,name:'Muzday Ayran',description:'500 ml',price:12000,available:true},
    {id:8,category_id:4,name:'Anar Fresh & Shay',description:'Anar sheli hám shay.',price:30000,available:true}
  ];
  let categories=[],items=[],activeCategory=0,menuNotice='',orderType='pickup',tableToken=new URLSearchParams(location.search).get('t');
  let tableNumber=null,busy=false,cart={};
  try { cart=JSON.parse(localStorage.getItem('qaraqalpagim-cart')||'{}')||{}; } catch { cart={}; }
  let toastTimer;
  function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
  function persist(){try{localStorage.setItem('qaraqalpagim-cart',JSON.stringify(cart));}catch{} renderCart();}
  function count(){return Object.values(cart).reduce((n,v)=>n+v.qty,0);}
  function total(){return Object.entries(cart).reduce((n,[id,v])=>n+(items.find(x=>String(x.id)===String(id))?.price||0)*v.qty,0);}
  function renderCategories(){
    $('category-list').innerHTML=[{id:0,name:'Barlıǵı'},...categories].map(c=>`<button class="category-chip ${Number(activeCategory)===Number(c.id)?'active':''}" data-category="${c.id}">${esc(c.name)}</button>`).join('');
    $('category-list').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{activeCategory=Number(b.dataset.category);renderCategories();renderMenu();}));
  }
  function renderMenu(){
    const list=items.filter(x=>x.available && (!activeCategory || Number(x.category_id)===activeCategory));
    $('menu-grid').innerHTML=list.map(x=>`<article class="dish-card"><button class="dish-image detail-trigger" data-detail="${x.id}" aria-label="${esc(x.name)} — tolıq maǵlıwmat">${x.image_url?`<img loading="lazy" src="${esc(x.image_url)}" alt="${esc(x.name)}" onerror="this.remove()">`:'<div class="no-image"><span class="material-symbols-outlined">restaurant</span></div>'}</button><div class="dish-body"><div class="dish-top"><button class="dish-title detail-trigger" data-detail="${x.id}">${esc(x.name)}</button><b class="dish-price">${fmt(x.price)}</b></div><p class="dish-desc">${esc(x.description||'Dástúrli dámdi awqat.')}</p><button class="dish-add" data-add="${x.id}">+ Sebetke qosıw</button></div></article>`).join('');
    $('menu-grid').querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addItem(b.dataset.add)));
    $('menu-grid').querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>showDetail(b.dataset.detail)));
    $('menu-status').textContent=list.length?menuNotice:'Bul bólimde házir awqat joq.';
  }
  function showDetail(id){const it=items.find(x=>String(x.id)===String(id));if(!it)return;$('dish-detail-content').innerHTML=`${it.image_url?`<div class="detail-image"><img src="${esc(it.image_url)}" alt="${esc(it.name)}"></div>`:''}<div class="detail-content"><span class="eyebrow">QARAQALPAQ DÁSTÚRI</span><h2>${esc(it.name)}</h2><p>${esc(it.description||'Dástúrli dámdi awqat.')}</p><b class="detail-price">${fmt(it.price)}</b><button class="btn btn-primary btn-wide" id="detail-add">Sebetke qosıw</button></div>`;$('dish-dialog').showModal();$('detail-add').addEventListener('click',()=>{addItem(id);$('dish-dialog').close();});}
  function addItem(id){const it=items.find(x=>String(x.id)===String(id));if(!it)return;cart[id]=cart[id]||{qty:0,note:''};cart[id].qty=Math.min(50,cart[id].qty+1);persist();toast(`${it.name} sebetke qosıldı`);}
  function renderCart(){
    $('cart-count').textContent=count();$('cart-total').textContent=fmt(total());$('checkout-btn').disabled=!count()||busy;
    $('cart-lines').innerHTML=Object.entries(cart).map(([id,line])=>{const it=items.find(x=>String(x.id)===String(id));if(!it)return'';return `<div class="cart-line"><div><h3>${esc(it.name)}</h3><small>${fmt(it.price)} · ${fmt(it.price*line.qty)}</small><div class="cart-line-controls"><button class="qty-btn" data-qty="${id}" data-delta="-1" aria-label="Kemeytiw">−</button><b>${line.qty}</b><button class="qty-btn" data-qty="${id}" data-delta="1" aria-label="Kóbeytiw">+</button><button class="remove-btn" data-remove="${id}">Óshiriw</button></div><input class="cart-note" data-note="${id}" maxlength="200" placeholder="Oshpazǵa esletpe (qálew boyınsha)" value="${esc(line.note||'')}"></div></div>`}).join('') || '<p class="empty-state">Sebetińiz házir bos. Menyudan súyikli awqatıńızdı tańlań.</p>';
    $('cart-lines').querySelectorAll('[data-qty]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.qty;cart[id].qty+=Number(b.dataset.delta);if(cart[id].qty<=0)delete cart[id];persist();}));
    $('cart-lines').querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{delete cart[b.dataset.remove];persist();}));
    $('cart-lines').querySelectorAll('[data-note]').forEach(input=>input.addEventListener('change',()=>{cart[input.dataset.note].note=input.value.trim();persist();}));
    $('checkout-area').hidden=!count();$('drawer-foot');
  }
  function openCart(){$('cart-backdrop').hidden=false;$('cart-drawer').classList.add('open');$('cart-drawer').setAttribute('aria-hidden','false');document.body.classList.add('locked');}
  function closeCart(){$('cart-backdrop').hidden=true;$('cart-drawer').classList.remove('open');$('cart-drawer').setAttribute('aria-hidden','true');document.body.classList.remove('locked');}
  function setOrderType(type){orderType=type;document.querySelectorAll('#order-types button').forEach(b=>b.classList.toggle('selected',b.dataset.type===type));$('address-wrap').hidden=type!=='delivery';}
  async function load(){
    $('year').textContent=new Date().getFullYear();
    if(tableToken && sb){const {data,error}=await sb.rpc('get_table',{tok:tableToken});if(error||!data){$('menu-status').textContent='QR kod jaramsız yamasa stol házir aktiv emes. Xızmetkerge muraját etiń.';$('menu-grid').innerHTML='';return;}tableNumber=data;orderType='dinein';$('order-types').hidden=true;$('customer-info').hidden=true;}
    if(sb){
      const [c,m]=await Promise.all([sb.from('categories').select('id,name,sort').order('sort'),sb.from('menu_items').select('id,category_id,name,description,price,image_url,available').eq('available',true).order('id')]);
      if(!c.error&&!m.error){categories=c.data||[];items=m.data||[];menuNotice='';}
      else {menuNotice='Serverge baylanıs joq. Demo menyu kórsetilmekte; buyırtpa jiberiw ushın Supabase baylanısın tekseriń.';console.error(c.error||m.error);categories=[];items=fallback;}
    } else {categories=[{id:1,name:'Milliy awqatlar',sort:1},{id:2,name:'Káwáplar',sort:2},{id:3,name:'Salatlar',sort:3},{id:4,name:'Ishimlikler',sort:4}];items=fallback;menuNotice='Demo rejimi: Supabase konfiguraciyası qosılmaǵan. Buyırtpa jiberiw ushın konfiguraciyanı toltırıń.';}
    renderCategories();renderMenu();renderCart();
  }
  async function submitOrder(){
    if(busy||!count())return;
    if(!sb){$('checkout-error').textContent='Supabase jalǵanbaǵan. Buyırtpa saqlanbadı.';return;}
    const name=$('customer-name').value.trim(),phone=$('customer-phone').value.trim(),address=$('customer-address').value.trim();
    if(!tableNumber && name.length<2){$('checkout-error').textContent='Atıńızdı durıs kiritiń.';return;}
    if(!tableNumber && phone.replace(/\D/g,'').length<7){$('checkout-error').textContent='Telefon nómerin durıs kiritiń.';return;}
    if(orderType==='delivery'&&address.length<5){$('checkout-error').textContent='Jetkiziw mánzilin tolıq kiritiń.';return;}
    const lines=Object.entries(cart).map(([id,v])=>({id:Number(id),qty:v.qty,note:v.note||''}));
    const idem=crypto.randomUUID();busy=true;$('checkout-error').textContent='';$('checkout-btn').disabled=true;$('checkout-btn').textContent='Jiberilmekte...';
    try{
      const {data,error}=await sb.rpc('create_order',{p:{type:tableNumber?'dinein':orderType,idem,table:tableToken,name,phone,address,note:$('order-note').value.trim(),items:lines}});
      if(error)throw error;
      cart={};persist();$('cart-lines').innerHTML=`<div class="empty-state"><span class="material-symbols-outlined" style="font-size:44px;color:var(--gold)">check_circle</span><h3>Buyırtpańız qabıllandı!</h3><p>Buyırtpa nomeri: <b>#${esc(data)}</b></p><p>Biz siz benen tez arada baylanısamız.</p></div>`;$('checkout-area').hidden=true;$('checkout-btn').textContent='Jaqsı';$('checkout-btn').disabled=false;$('checkout-btn').onclick=()=>{closeCart();location.reload();};
    }catch(err){console.error(err);$('checkout-error').textContent='Buyırtpa jiberilmedi. Internetti tekserip, qayta urınıp kóriń.';busy=false;$('checkout-btn').textContent='Buyırtpanı rásmiylestiriw';$('checkout-btn').disabled=false;}
  }
  $('detail-close').addEventListener('click',()=>$('dish-dialog').close());
  $('dish-dialog').addEventListener('click',e=>{if(e.target===$('dish-dialog'))$('dish-dialog').close();});
  $('cart-open').addEventListener('click',openCart);$('cart-close').addEventListener('click',closeCart);$('cart-backdrop').addEventListener('click',closeCart);
  $('checkout-btn').addEventListener('click',submitOrder);
  $('order-types').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setOrderType(b.dataset.type)));
  $('mobile-menu-toggle').addEventListener('click',()=>$('mobile-nav').classList.toggle('open'));
  $('mobile-nav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>$('mobile-nav').classList.remove('open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();$('mobile-nav').classList.remove('open');}});
  setOrderType(tableToken?'dinein':'pickup');load().catch(e=>{console.error(e);$('menu-status').textContent='Menyu júkleniwinde qáte júz berdi.';});
})();