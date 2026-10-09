const $ = id => document.getElementById(id);

let mode = 'login';
let timer = null;

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

// Accounts and sessions now live on the server (PHP + MySQL).
// The password is sent to the server over the page's connection,
// so run this on HTTPS when it goes live.
$('go').onclick = async () => {
    const email = $('email').value.trim().toLowerCase();
    const pw = $('pass').value;

    $('aerr').textContent = '';

    if (!email || pw.length < 8) {
        $('aerr').textContent =
            'Enter an email and a password of 8+ characters.';
        return;
    }

    $('go').disabled = true;

    try {
        await api(
            'auth.php',
            mode === 'sign'
                ? {
                    action: 'signup',
                    email,
                    password: pw,
                    name: $('name').value,
                    office: $('office').value,
                    invite: $('invite').value
                }
                : { action: 'login', email, password: pw }
        );

        $('pass').value = '';
        show(true);
    } catch (e) {
        $('aerr').textContent = e.message;
    }

    $('go').disabled = false;
};

$('out').onclick = async () => {
    try {
        await api('auth.php', { action: 'logout' });
    } catch (e) { /* leave the dashboard anyway */ }

    show(false);
};

function show(on) {
    $('auth').classList.toggle('hidden', on);
    $('dash').classList.toggle('hidden', !on);

    clearInterval(timer);

    if (on) {
        render();
        timer = setInterval(render, 5000);
    }
}

$('fRoute').innerHTML = ROUTES
    .map(r => `<option>${r}</option>`)
    .join('');

['fRoute', 'fTime'].forEach(id => {
    $(id).onchange = render;
});

$('demo').onclick = async () => {
    const ev = [];
    const now = Date.now();

    ROUTES.forEach(r => {
        const searches = Math.floor(Math.random() * 70);
        const boardings = Math.floor(Math.random() * 10);

        for (let i = 0; i < searches; i++) {
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

        for (let i = 0; i < boardings; i++) {
            ev.push({
                type: 'boarding',
                route: r,
                ts: now - Math.random() * 3e6
            });
        }
    });

    $('demo').disabled = true;

    try {
        await api('admin.php', { action: 'demo', events: ev });
        render();
    } catch (e) {
        alert(e.message);
    }

    $('demo').disabled = false;
};

$('clear').onclick = async () => {
    if (!confirm('Delete all search data?')) {
        return;
    }

    try {
        await api('admin.php', { action: 'clear' });
        render();
    } catch (e) {
        alert(e.message);
    }
};

async function render() {
    if ($('dash').classList.contains('hidden')) {
        return;
    }

    const r = $('fRoute').value;
    let data;

    try {
        data = await api('stats.php?route=' + encodeURIComponent(r));
    } catch (e) {
        if (e.status === 401) {
            show(false);
            $('aerr').textContent = 'Session ended. Please log in again.';
        } else {
            $('meta').textContent = 'Cannot load data: ' + e.message;
        }
        return;
    }

    // only count routes in the current ROUTES list,
    // so old/renamed routes don't create stray rows
    const known = new Set(ROUTES);
    const byRoute = new Map(data.rows.map(x => [x.route, x]));

    const rows = ROUTES
        .map(name => {
            const x = byRoute.get(name);

            return {
                r: name,
                m10: x ? x.m10 : 0,
                hr: x ? x.hr : 0
            };
        })
        .sort(
            (a, b) =>
                b.m10 - a.m10 ||
                b.hr - a.hr
        );

    const red = rows.filter(
        x => level(x.m10) === 'High'
    );

    const known_rows = data.rows.filter(x => known.has(x.route));

    $('sTotal').textContent = known_rows.reduce((s, x) => s + x.s_today, 0);

    $('sRed').textContent = red.length;

    // with many routes the list can get long: show the top 3 + a count
    $('sRedN').textContent =
        red.length > 3
            ? red.slice(0, 3).map(x => x.r).join(', ') +
            ` +${red.length - 3} more`
            : red.map(x => x.r).join(', ');

    $('sBusy').textContent =
        rows[0]?.m10
            ? rows[0].r
            : '-';

    $('sBusyN').textContent =
        rows[0]?.m10
            ? rows[0].m10 + ' searches'
            : '';

    $('sBoard').textContent = known_rows.reduce((s, x) => s + x.b_today, 0);

    $('rows').innerHTML = rows
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
        `${rows.length} jeepney routes · ` +
        `aggregated, non-identifying data · ` +
        `Updated ${new Date().toLocaleTimeString()}`;

    const [a, b] = $('fTime').value
        .split('-')
        .map(Number);

    const bins = {};

    for (let h = a; h < b; h++) {
        bins[h] = data.hours?.[h] ?? 0;
    }

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

// are we already logged in? (PHP session cookie)
api('auth.php')
    .then(r => show(r.loggedIn))
    .catch(() => {
        show(false);
        $('aerr').textContent =
            'Cannot reach the server. Is Apache/PHP and MySQL running?';
    });