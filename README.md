# QARAQALPAQ ASXANASI — asxana sanlı platforması

Qaraqalpaq tilindegi restoran web-saytı, sebet, QR-stol buyırtpaları hám admin paneli. Stitch dizaynınıń qara-fon/gúl-altın palitrası, Playfair Display + Plus Jakarta Sans tipografikası hám responsive karta usılı integraciyalandı.

## Imkaniyatlar

- Bas bet, asxana haqqında bólim, baylanıs bólimi.
- Supabase-ten kategoriyalar hám menyu júklew.
- Kategoriya boyınsha filtrlew, taǵam bahası/sıpatlaması/súwreti.
- Sebet: qosıw, alıp taslaw, sanın ózgertiw, jami bahasın esaplaw.
- Buyırtpa: ózi alıp ketiw, jetkiziw, QR arqalı stol buyırtpası.
- Buyırtpanı serverdegi RPC arqalı saqlaw; baha bazadan qayta esaplanadı.
- Admin: Auth arqalı kiriw, admin rolın tekseriw, buyırtpalardı/statusın basqarıw, kategoriya/taǵam CRUD, súwret júklew, QR-stollar.
- RLS hám `SECURITY DEFINER` RPC funksiyaları ushın qáwipsiz `search_path`.

## 1. Jergilikli iske túsiriw

Talap: Node.js 20+ hám npm. Frontend browser CDN arqalı Supabase SDK hám QRCode qollanadı; Node package dependency joq.

```bash
npm install
npm run dev
```

Vite kórsetken localhost mánzilin ashıń. Admin panel: `/admin.html`.

Production build (offline, build tool dependency talap etpeydi):

```bash
npm run build
npm run preview
```

Build nátiyjesi `dist/` papkasına túsedi. `js/config.js` — browser ushın ashıq publishable/anon key saqlaytuǵın konfiguraciya. Bul faylǵa `service_role` yamasa secret keyti hesh qashan jazbań.

## 2. Supabase jalǵaw

1. Supabase-ta project ashıń yamasa bar projectti qollanıń.
2. SQL Editor-de `supabase/schema.sql` faylın tolıq isletiń. Bul jańa bazanıń sxeması, RLS siyasatları, RPC funksiyaları, `food` storage bucket hám baslanǵısh menyunı jaratadı.
3. Project Settings → API bóliminen Project URL hám publishable (yamasa anon public) key alıń.
4. `.env.example` faylın `.env` dep kóshirip, `SUPABASE_URL` hám `SUPABASE_ANON_KEY` mánislerin kiritiń. Dev server hám production build `.env` faylın oqıydı. `.env` bolmasa, `js/config.js` ishindegi aldınǵı browser public konfiguraciyası fallback retinde qollanıladı. Qáleseńiz `js/config.js.example` arqalı konfiguraciyanı qol menen de toltıra alasız.
5. Supabase Authentication → Users arqalı admin paydalanıwshısın jaratıń.
6. SQL Editor-de tómendegini óz emailińiz benen isletiń:

```sql
insert into public.admins(user_id)
select id from auth.users where email = 'ADMIN_EMAIL';
```

7. Storage `food` bucket public súwretlerdi oqıwǵa ashıq, biraq júklew/óshiriw tek adminge ruxsat etilgen.
8. Authentication → URL Configuration bóliminde local hám production sayt URL-ların qosıń.

### Environment

`.env.example` — konfiguraciya úlgisi. `.env` faylı build/dev waqtında browser ushın `js/config.js` generaciyalaydı; `.env` dist papkasına kóshirilmeydi. Browserge tek publishable/anon key beriledi. `service_role`/secret key serverden tısqa shıǵarılmaydı.

## 3. Database hám qáwipsizlik

- `categories` hám tek `available=true` bolǵan `menu_items` anonim paydalanıwshılarǵa oqıwǵa ashıq.
- Admin CRUD, buyırtpalar, buyırtpa itemleri hám stollar Auth + `admins` RLS siyasatı menen qorǵalǵan.
- `create_order(jsonb)` klient jiberген bahalardı qollanbaydı: hár bir taǵamnıń házirgi bahasın bazadan alıp jami bahasın serverde esaplaydı.
- Idempotency UUID birdey buyırtpanı qayta jaratıwdan saqlaydı.
- `get_table(text)` tek aktiv stol tokenin tekseredi.
- SQL funksiyalarında `SECURITY DEFINER` hám sheklengen `search_path` qollanılǵan.

Bar bolǵan Supabase bazasında jańalawdan aldın backup alıń. `supabase/migrations/20261110_harden_ordering_and_rls.sql` qáwipsizlik jańalawların belgileydi; bar sxema menen salıstırıp, maintenance waqtında jańalanǵan `schema.sql` isletiliwi kerek. Bul migration faylı avtomat backup ornına júrmeydi.

## 4. Buyırtpa hám admin

- QR stol: Admin → Stollar → stol qosıw → PNG júklew yamasa basıp shıǵarıw. QR `index.html?t=TOKEN` betin ashıp, stol buyırtpasın baylaydı.
- Mijoz buyırtpası: menyudan awqat qosıń → sebet → alıp ketiw/jetkiziw maǵlıwmatların toltırıń → rásmiylestiriń.
- Admin: `/admin.html`. Tek `admins` kestesinde user_id bar Auth paydalanıwshısı kiriwi múmkin.

## 5. Test hám sheklewler

Build hám statikalıq tekseriwdi `npm run build` penen orınlań. Supabase runtime testleri tek sizdiń project credentials, Auth user hám database konfiguraciyası menen isletiledi. Bul ZIPti jaratıw waqtında real Supabase auth/order/storage requestlerin jiberiw múmkin bolmadı; sondıqtan canlı backend baylanısı tastıyıqlanǵan dep esaplanbaydı.

Customer order history/auth flow aldınǵı sxemada bolmaǵanlıqtan qospadıq; bar buyırtpalar admin panelinde kórinedi. Online tólem, jetkiziw tarifleri, anıq telefon/mánzil hám social accountlar berilmegen, sondıqtan olardı oylap qospaǵanbız.

## Stitch dizayn derekleri

`assets/stitch-*-reference.png` — berilgen Stitch ekranlarınıń original preview súwretleri; `design-reference/` ishinde HTML hám DESIGN.md derekleri de saqlanǵan. `stitch_qaraqalpag_im_restaurant_digital_experience` arxivindegi design tokens hám UI baǵdarı actual customer-facing betke integraciyalandı.
