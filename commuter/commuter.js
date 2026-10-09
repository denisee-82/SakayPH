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

const RANK = { Low: 0, Moderate: 1, High: 2 };

let plans = [];     // trip options currently listed
let current = null; // the plan the commuter picked

// demand comes from the server: route -> { m10, hr } (searches)
let demand = {};
let demandOk = false;

const count = r => demand[r]?.m10 ?? 0;

async function refreshDemand() {
    try {
        demand = (await api('demand.php')).routes;
        demandOk = true;
    } catch (e) {
        demandOk = false;
    }

    drawChips();
}

/* Search suggestions: landmarks only */
$('places').innerHTML = LANDMARKS
    .map(l => `<option value="${l.name}">`)
    .join('');

function drawChips() {
    $('chips').innerHTML = PILOT
        .map(
            r =>
                `<button class="chip" data-r="${r}">
                    <span style="color:${demandOk ? COLOR[level(count(r))] : '#999'}">●</span> ${r}
                </button>`
        )
        .join('');
}

drawChips();
refreshDemand();

$('chips').onclick = e => {
    const r = e.target.closest('.chip')?.dataset.r;

    if (r) {
        $('to').value = r;
        $('to').focus();
    }
};

// The map is a driving reference only; jeepneys follow their own routes.
function setMap(from, to) {
    const q =
        from && to
            ? `saddr=${encodeURIComponent(from + ', Davao City')}&daddr=${encodeURIComponent(to + ', Davao City')}`
            : `q=Davao+City`;

    $('map').src = `https://maps.google.com/maps?${q}&output=embed`;
}

setMap();

/* ---------- matching (helpers live in data.js) ---------- */

// landmarks the typed text refers to, plus an exact route name
// (so the quick-pick chips keep working)
function matches(raw) {
    const t = norm(raw);

    return {
        landmarks: LANDMARKS.filter(l =>
            [l.name, ...l.aliases].some(n => fits(t, n))
        ),
        routes: ROUTES.filter(r => norm(r) === t)
    };
}

// all the route places the matched landmarks are served at
const stopsOf = landmarks => [...new Set(landmarks.flatMap(l => l.stops))];

$('find').onclick = () => {
    const f = $('from').value.trim();
    const t = $('to').value.trim();

    $('err').textContent = '';

    if (!f || !t) {
        $('err').textContent = 'Please enter both From and To.';
        return;
    }

    setMap(f, t);

    const fm = matches(f);
    const tm = matches(t);

    if (!fm.landmarks.length && !fm.routes.length) {
        $('err').textContent =
            `Starting point "${f}" not found. Try Bankerohan or SM City Davao.`;
        return;
    }

    if (!tm.landmarks.length && !tm.routes.length) {
        $('err').textContent =
            `Destination "${t}" not found. Try SM City Davao or Bankerohan.`;
        return;
    }

    const fromStops = stopsOf(fm.landmarks);
    const toStops = stopsOf(tm.landmarks);

    // 1) real trips: direct rides, or one transfer if there is no direct ride
    plans = fromStops.length && toStops.length
        ? planTrip(fromStops, toStops)
        : [];

    // 2) a route typed by name (the quick-pick chips) is listed too
    [...new Set([...tm.routes, ...fm.routes])].forEach(r => {
        if (plans.some(p => p.legs.length === 1 && p.legs[0].route === r)) return;

        let note = '';

        if (!PATHS[r]) {
            note = 'Stops for this route are not mapped yet';
        } else if (fromStops.length && !fromStops.some(s => PATHS[r].includes(s))) {
            note = `Does not pass ${f}`;
        }

        plans.push({ legs: [{ route: r, from: null, to: null }], note });
    });

    if (!plans.length) {
        const unmapped = [...fm.landmarks, ...tm.landmarks]
            .filter(l => !landmarkRoutes(l).length)
            .map(l => l.name);

        $('err').textContent = unmapped.length
            ? `No jeepney routes added for ${unmapped[0]} yet.`
            : `No jeepney found from ${f} to ${t} within 2 rides.`;
        return;
    }

    $('multi').textContent =
        plans.length > 1
            ? 'Multiple options found. Choose one'
            : 'Choose a jeepney';

    $('list').innerHTML = plans
        .map((p, i) => {
            const n = p.legs.length;

            return `
                <div class="opt" data-i="${i}">
                    <b>${i + 1} ${p.legs.map(l => l.route).join(' → ')}</b>
                    ${n > 1 ? `<small>1 transfer, at ${p.legs[0].to}</small>` : ''}
                    ${p.legs
                .map(l =>
                    l.from
                        ? `<small>${l.route}: board at ${l.from}, get off at ${l.to}</small>`
                        : ''
                )
                .join('')}
                    ${p.note ? `<small>${p.note}</small>` : ''}

                    <div class="row">
                        <span>Regular fare${n > 1 ? ' per ride' : ''}</span>
                        <span>₱${REGULAR_FARE}</span>
                    </div>

                    <div class="row">
                        <span>Total Fare${n > 1 ? ` (${n} rides)` : ''}</span>
                        <span>₱${REGULAR_FARE * n}</span>
                    </div>
                </div>
            `;
        })
        .join('');

    $('results').classList.remove('hidden');
    $('selected').classList.add('hidden');

    $('results').scrollIntoView({
        behavior: 'smooth'
    });
};

$('list').onclick = async e => {
    const o = e.target.closest('.opt');

    if (!o) return;

    document
        .querySelectorAll('.opt')
        .forEach(x => x.classList.remove('on'));

    o.classList.add('on');

    current = plans[+o.dataset.i];

    const legs = current.legs;
    const n = legs.length;

    // one search is logged for every jeepney on the trip,
    // so the dashboard counts demand on each route
    await Promise.all(legs.map(l => DB.log('search', l.route)));
    await refreshDemand();

    const stats = legs.map(l => {
        const c = count(l.route);
        return { ...l, n: c, lv: level(c) };
    });

    const worst = stats.reduce(
        (w, s) => (RANK[s.lv] > RANK[w] ? s.lv : w),
        'Low'
    );

    $('sRoute').textContent = legs.map(l => l.route).join(' → ');
    $('sFare').textContent = '₱' + (REGULAR_FARE * n).toFixed(2);
    $('sStu').textContent = '₱' + (STUDENT_FARE * n).toFixed(2);

    $('sLegs').innerHTML =
        stats
            .map(
                (s, i) => `
                    <div class="leg">
                        <b>${n > 1 ? `Ride ${i + 1}: ` : ''}${s.route}</b>
                        ${s.from ? `<div>Board at ${s.from}, get off at ${s.to}</div>` : ''}
                        <div>
                            Demand:
                            ${demandOk
                    ? `<span style="color:${COLOR[s.lv]}">●</span> ${s.lv}
                                   (${s.n} search${s.n == 1 ? '' : 'es'})`
                    : 'unavailable right now'}
                        </div>
                    </div>
                `
            )
            .join('') +
        (n > 1
            ? `<div class="note" style="text-align:left">
                   Transfer at ${legs[0].to}. Fare is paid on each ride.
               </div>`
            : '');

    $('alertBox').textContent = demandOk ? MSG[worst] : 'Demand data unavailable right now';
    $('alertBox').className = 'alert ' + (demandOk ? worst : 'None');

    $('basis').textContent =
        !demandOk
            ? ''
            : n > 1
                ? 'Based on commuter searches in the last 10 minutes. The alert shows the busiest ride on your trip.'
                : `Based on commuter searches in the last 10 minutes - ${stats[0].n} search${stats[0].n == 1 ? '' : 'es'}`;

    $('rode').disabled = false;
    $('rode').textContent = n > 1 ? '✓ I rode this trip' : '✓ I rode this route';

    $('selected').classList.remove('hidden');

    $('selected').scrollIntoView({
        behavior: 'smooth'
    });
};

$('rode').onclick = () => {
    if (!current) return;

    current.legs.forEach(l => DB.log('boarding', l.route));

    $('rode').textContent = 'Thanks! Boarding confirmed';
    $('rode').disabled = true;
};

$('cancel').onclick = () => {
    $('from').value = '';
    $('to').value = '';
    $('err').textContent = '';

    plans = [];
    current = null;

    ['results', 'selected'].forEach(id =>
        $(id).classList.add('hidden')
    );

    setMap();
};