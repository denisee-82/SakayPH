const $ = id => document.getElementById(id);

const MSG = {
 High: 'High demand: expect a crowded ride',
 Moderate: 'Moderate demand: some wait expected',
 Low: 'Low demand: easy ride'
};

const COLOR = {
 High: '#ff4040',
 Moderate: '#e0a96d',
 Low: '#4caf50'
};

let current = null;

function count(r) {
 return DB.get('events', []).filter(
     e =>
         e.type === 'search' &&
         e.route === r &&
         Date.now() - e.ts < 6e5
 ).length;
}

$('places').innerHTML = [...ROUTES, ...ROADS]
    .map(p => `<option value="${p}">`)
    .join('');

$('chips').innerHTML = PILOT
    .map(
        r =>
            `<button class="chip" data-r="${r}">
                <span style="color:${COLOR[level(count(r))]}">●</span> ${r}
            </button>`
    )
    .join('');

$('chips').onclick = e => {
 const r = e.target.closest('.chip')?.dataset.r;

 if (r) {
  $('to').value = r;
  $('to').focus();
 }
};

function setMap(from, to) {
 const q =
     from && to
         ? `saddr=${encodeURIComponent(from + ', Davao City')}&daddr=${encodeURIComponent(to + ', Davao City')}`
         : `q=Davao+City`;

 $('map').src = `https://maps.google.com/maps?${q}&output=embed`;
}

setMap();

function matches(t) {
 return ROUTES.filter(r =>
     t.toLowerCase().includes(r.toLowerCase())
 );
}

$('find').onclick = () => {
 const f = $('from').value.trim();
 const t = $('to').value.trim();

 $('err').textContent = '';

 if (!f || !t) {
  $('err').textContent = 'Please enter both From and To.';
  return;
 }

 setMap(f, t);

 const found = [...new Set([...matches(t), ...matches(f)])];

 if (!found.length) {
  $('err').textContent =
      'No jeepney route matched. Try a route name like Ma-a or Toril.';
  return;
 }

 $('multi').textContent =
     found.length > 1
         ? 'Multiple routes found. Choose one'
         : 'Choose a route';

 $('list').innerHTML = found
     .map(
         (r, i) => `
                <div class="opt" data-r="${r}">
                    <b>${i + 1} ${r}</b>

                    <div class="row">
                        <span>Regular fare</span>
                        <span>₱${REGULAR_FARE}</span>
                    </div>

                    <div class="row">
                        <span>Total Fare</span>
                        <span>₱${REGULAR_FARE}</span>
                    </div>
                </div>
            `
     )
     .join('');

 $('results').classList.remove('hidden');
 $('selected').classList.add('hidden');

 $('results').scrollIntoView({
  behavior: 'smooth'
 });
};

$('list').onclick = e => {
 const o = e.target.closest('.opt');

 if (!o) return;

 document
     .querySelectorAll('.opt')
     .forEach(x => x.classList.remove('on'));

 o.classList.add('on');

 current = o.dataset.r;

 DB.log('search', current);

 const n = count(current);
 const lv = level(n);

 $('sRoute').textContent = current;
 $('sFare').textContent = '₱' + REGULAR_FARE.toFixed(2);
 $('sStu').textContent = '₱' + STUDENT_FARE.toFixed(2);

 $('alertBox').textContent = MSG[lv];
 $('alertBox').className = 'alert ' + lv;

 $('basis').textContent =
     `Based on commuter searches in the last 10 minutes - ${n} search${n == 1 ? '' : 'es'}`;

 $('rode').disabled = false;
 $('rode').textContent = '✓ I rode this route';

 $('selected').classList.remove('hidden');

 $('selected').scrollIntoView({
  behavior: 'smooth'
 });
};

$('rode').onclick = () => {
 DB.log('boarding', current);
 $('rode').textContent = 'Thanks! Boarding confirmed';
 $('rode').disabled = true;
};

$('cancel').onclick = () => {
 $('from').value = '';
 $('to').value = '';
 $('err').textContent = '';

 ['results', 'selected'].forEach(id =>
     $(id).classList.add('hidden')
 );

 setMap();
};