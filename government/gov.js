const $ = id => document.getElementById(id);

let mode = 'login';

async function hash(s) {
 try {
  const b = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(s)
  );

  return [...new Uint8Array(b)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
 } catch (e) {
  return btoa(s);
 }
}

function tab(m) {
 mode = m;

 $('tLogin').classList.toggle('on', m === 'login');
 $('tSign').classList.toggle('on', m === 'sign');

 $('signOnly').classList.toggle('hidden', m === 'login');

 $('go').textContent =
     m === 'login'
         ? 'Log in'
         : 'Create account';
}

$('tLogin').onclick = () => tab('login');
$('tSign').onclick = () => tab('sign');

$('go').onclick = async () => {
 const email = $('email').value.trim().toLowerCase();
 const pw = $('pass').value;
 const users = DB.get('users', []);

 $('aerr').textContent = '';

 if (!email || pw.length < 6) {
  $('aerr').textContent =
      'Enter an email and a password of 6+ characters.';
  return;
 }

 const h = await hash(pw);

 if (mode === 'sign') {
  if (users.some(u => u.email === email)) {
   $('aerr').textContent =
       'Email already registered.';
   return;
  }

  users.push({
   email,
   hash: h,
   name: $('name').value,
   office: $('office').value
  });

  DB.set('users', users);
  DB.set('session', email);

  show();
 } else {
  if (!users.some(u => u.email === email && u.hash === h)) {
   $('aerr').textContent =
       'Wrong email or password.';
   return;
  }

  DB.set('session', email);
  show();
 }
};

$('out').onclick = () => {
 localStorage.removeItem('sakayph_session');
 show();
};

function show() {
 const on = !!DB.get('session', null);

 $('auth').classList.toggle('hidden', on);
 $('dash').classList.toggle('hidden', !on);

 if (on) {
  render();
 }
}

$('fRoute').innerHTML = PILOT
    .map(r => `<option>${r}</option>`)
    .join('');

['fRoute', 'fTime'].forEach(id => {
 $(id).onchange = render;
});

$('demo').onclick = () => {
 const ev = DB.get('events', []);
 const now = Date.now();

 PILOT.forEach((r, k) => {
  for (let i = 0; i < 60 + k * 8; i++) {
   const t =
       Math.random() < 0.5
           ? now - Math.random() * 3.6e6
           : new Date().setHours(
               8 + Math.floor(Math.random() * 12),
               Math.random() * 60
           );

   ev.push({
    type: 'search',
    route: r,
    ts: Math.min(t, now)
   });
  }

  for (let i = 0; i < 8; i++) {
   ev.push({
    type: 'boarding',
    route: r,
    ts: now - Math.random() * 3e6
   });
  }
 });

 DB.set('events', ev);
 render();
};

$('clear').onclick = () => {
 if (confirm('Delete all search data?')) {
  DB.set('events', []);
  render();
 }
};

function render() {
 if (!DB.get('session', null)) {
  return;
 }

 const ev = DB.get('events', []);
 const now = Date.now();
 const day = new Date().setHours(0, 0, 0, 0);

 const S = ev.filter(e => e.type === 'search');
 const B = ev.filter(
     e =>
         e.type === 'boarding' &&
         e.ts >= day
 );

 const routes = [
  ...new Set([
   ...PILOT,
   ...S.map(e => e.route)
  ])
 ];

 const rows = routes
     .map(r => {
      const s = S.filter(e => e.route === r);

      return {
       r,
       m10: s.filter(
           e => now - e.ts < 6e5
       ).length,
       hr: s.filter(
           e => now - e.ts < 3.6e6
       ).length
      };
     })
     .sort(
         (a, b) =>
             b.m10 - a.m10 ||
             b.hr - a.hr
     );

 const pil = rows.filter(x =>
     PILOT.includes(x.r)
 );

 const red = pil.filter(
     x => level(x.m10) === 'High'
 );

 $('sTotal').textContent = S.filter(
     e =>
         e.ts >= day &&
         PILOT.includes(e.route)
 ).length;

 $('sRed').textContent =
     `${red.length} of ${PILOT.length}`;

 $('sRedN').textContent =
     red.map(x => x.r).join(', ');

 $('sBusy').textContent =
     pil[0]?.m10
         ? pil[0].r
         : '-';

 $('sBusyN').textContent =
     pil[0]?.m10
         ? pil[0].m10 + ' searches'
         : '';

 $('sBoard').textContent = B.length;

 $('rows').innerHTML = rows
     .slice(0, 12)
     .map(
         x => `
                <tr>
                    <td>${x.r}</td>
                    <td><b>${x.m10}</b></td>
                    <td>
                        <span class="tag ${level(x.m10)}">
                            ${level(x.m10)} Demand
                        </span>
                    </td>
                    <td>${x.hr}</td>
                </tr>
            `
     )
     .join('');

 $('meta').textContent =
     `Pilot scope: ${PILOT.length} jeepney routes · ` +
     `aggregated, non-identifying data · ` +
     `Updated ${new Date().toLocaleTimeString()}`;

 const r = $('fRoute').value;

 const [a, b] = $('fTime').value
     .split('-')
     .map(Number);

 const bins = {};

 for (let h = a; h < b; h++) {
  bins[h] = 0;
 }

 S.filter(
     e =>
         e.route === r &&
         e.ts >= day
 ).forEach(e => {
  const h = new Date(e.ts).getHours();

  if (h in bins) {
   bins[h]++;
  }
 });

 const mx = Math.max(
     1,
     ...Object.values(bins)
 );

 $('cTitle').innerHTML =
     `Searches per hour
        <small style="color:#aaa;font-size:11px">
            ${r} · today
        </small>`;

 $('chart').innerHTML =
     Object.entries(bins)
         .map(
             ([h, n]) => `
                    <div style="height:${(n / mx) * 100}%">
                        <i>${n}</i>
                        <u>
                            ${h % 12 || 12}${h < 12 ? 'A' : 'P'}
                        </u>
                    </div>
                `
         )
         .join('');
}

window.addEventListener('storage', render);

setInterval(render, 5000);

show();