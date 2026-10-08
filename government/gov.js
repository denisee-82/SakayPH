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

$('fRoute').innerHTML = ROUTES
    .map(r => `<option>${r}</option>`)
    .join('');

['fRoute', 'fTime'].forEach(id => {
    $(id).onchange = render;
});

$('demo').onclick = () => {
    const ev = DB.get('events', []);
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

    // only count events for routes in the current ROUTES list,
    // so old/renamed routes from earlier data don't create stray rows
    const known = new Set(ROUTES);

    const S = ev.filter(
        e => e.type === 'search' && known.has(e.route)
    );
    const B = ev.filter(
        e =>
            e.type === 'boarding' &&
            known.has(e.route) &&
            e.ts >= day
    );

    const routes = ROUTES;

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

    const red = rows.filter(
        x => level(x.m10) === 'High'
    );

    $('sTotal').textContent = S.filter(
        e => e.ts >= day
    ).length;

    $('sRed').textContent = red.length;

    // with 80 routes the list can get long: show the top 3 + a count
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

    $('sBoard').textContent = B.length;

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