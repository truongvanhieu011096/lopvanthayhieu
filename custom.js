/* Chức năng Lớp văn thầy Hiếu.
   - Quản lý lớp học, Sổ nhắc việc, Sổ gọi tên: chỉ giáo viên, dữ liệu lưu trên trình duyệt của thầy (nhớ "Tải bản sao lưu").
   - Đọc sách, Blog, Quizz, Giải đáp: thầy soạn trong trang, bấm "Xuất noidung.js" rồi chép file đó đè lên file cũ
     (cùng thư mục index.html) để học sinh thấy. Học sinh chỉ đọc, không sửa được.
   - Sách điện tử: chép file PDF vào thư mục sach/ rồi ghi đường dẫn, ví dụ sach/tat-den.pdf (hoặc dán một liên kết). */
document.write('<script src="noidung.js"><\/script>');
(() => {
const LIEN_HE = ''; // Liên kết để học sinh gửi câu hỏi cho thầy, ví dụ 'https://zalo.me/0900000000' hoặc 'mailto:thay@email.com'. Để trống thì ẩn nút.
const $e = t => String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (x) { return d; } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (x) { alert('Không lưu được dữ liệu trên trình duyệt này'); } };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const nd = u => ({ sach: [], blog: [], quiz: [], hoidap: [], ...(window.LV_NOIDUNG || {}), ...(u.role === 'gv' ? ld('lv_nd', {}) : {}) });
const tai = (ten, nd2, kieu) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([nd2], { type: kieu })); a.download = ten; a.click(); };
const mau = t => 'hsl(' + ([...String(t)].reduce((a, c) => a + c.charCodeAt(0), 0) * 37 % 360) + ',60%,50%)';
const hnay = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const line = 'padding:7px 0;border-top:1px solid var(--line)';
const trong = t => `<div class="card empty">${t}</div>`;

/* Khung quản lý nội dung dùng chung: thầy thêm/sửa/xóa, học sinh chỉ xem */
function crud(el, user, c) {
  const d = nd(user), gv = user.role === 'gv', ds = d[c.key];
  if (!gv && c.view) return c.view(el, ds, () => c.view(el, ds, null));
  let h = '';
  if (gv) h += `<div class="card"><h3>${c.add}</h3><div style="display:grid;gap:8px;margin-top:8px">` + c.f.map(f => f.t
    ? `<textarea data-f="${f.n}" placeholder="${f.p}" style="min-height:${f.h || 90}px"></textarea>` : `<input data-f="${f.n}" placeholder="${f.p}">`).join('')
    + `</div><div class="row" style="margin-top:8px"><button class="b" id="sv">Lưu</button><button class="b s" id="xu">Xuất noidung.js</button></div><div class="sub" id="ms" style="margin-top:6px">${c.hint || ''}</div></div>`;
  else if (c.top) h += c.top;
  h += ds.length ? ds.map(i => `<div class="card">${c.show(i)}${gv ? `<div class="row" style="margin-top:8px"><button class="b s" data-e="${i.id}">Sửa</button><button class="b d" data-x="${i.id}">Xóa</button></div>` : ''}</div>`).join('') : trong('Chưa có nội dung');
  el.innerHTML = h;
  if (!gv) return;
  let ed = null; const F = () => [...el.querySelectorAll('[data-f]')], luu = n => { sv('lv_nd', { ...d, [c.key]: n }); crud(el, user, c); };
  el.querySelector('#sv').onclick = () => {
    const o = { id: ed || uid() }; F().forEach(x => o[x.dataset.f] = x.value.trim());
    if (!o[c.f[0].n]) { el.querySelector('#ms').textContent = 'Hãy nhập: ' + c.f[0].p; return; }
    if (c.ngay) o.ngay = (ed && ds.find(x => x.id === ed).ngay) || new Date().toLocaleDateString('vi-VN');
    luu(ed ? ds.map(i => i.id === ed ? o : i) : [o, ...ds]);
  };
  el.querySelector('#xu').onclick = () => tai('noidung.js', 'window.LV_NOIDUNG = ' + JSON.stringify(nd(user), null, 1) + ';', 'text/javascript');
  el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { const i = ds.find(x => x.id === b.dataset.e); ed = i.id; F().forEach(x => x.value = i[x.dataset.f] || ''); scrollTo(0, 0); });
  el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { if (confirm('Xóa mục này?')) luu(ds.filter(i => i.id !== b.dataset.x)); });
}
const van = t => `<div style="white-space:pre-wrap;margin-top:8px">${$e(t)}</div>`;

/* Đọc sách */
const SACH = {
  key: 'sach', add: 'Đăng sách điện tử', hint: 'Giá sách là tên ngăn sách; học sinh bấm vào sách để đọc. Đã sửa xong thì bấm "Xuất noidung.js".',
  f: [{ n: 'ten', p: 'Tên sách' }, { n: 'tg', p: 'Tác giả' }, { n: 'ke', p: 'Giá sách (ví dụ: Truyện ngắn lớp 8)' }, { n: 'link', p: 'Tệp hoặc liên kết (ví dụ: sach/tat-den.pdf)' }, { n: 'nd', p: 'Hoặc dán nội dung văn bản của sách ở đây', t: 1, h: 120 }],
  show: i => `<h3>${$e(i.ten)}</h3><div class="sub">${$e(i.tg)} · Giá: ${$e(i.ke || 'Khác')}</div>`,
  view(el, ds) {
    const ke = [...new Set(ds.map(i => i.ke || 'Khác'))];
    el.innerHTML = ds.length ? ke.map(k => `<div class="card"><h3>📚 ${$e(k)}</h3><div class="row" style="margin-top:10px;align-items:stretch">` + ds.filter(i => (i.ke || 'Khác') === k).map(i =>
      `<button class="b s" data-b="${i.id}" style="width:150px;min-height:110px;white-space:normal;border-left:6px solid ${mau(i.ten)}"><b>${$e(i.ten)}</b><br><span class="sub">${$e(i.tg)}</span></button>`).join('') + '</div></div>').join('') : trong('Thầy chưa đăng sách nào');
    el.querySelectorAll('[data-b]').forEach(b => b.onclick = () => {
      const i = ds.find(x => x.id === b.dataset.b);
      el.innerHTML = `<div class="card"><div class="row"><button class="b s" id="bk">← Giá sách</button><h3 class="g">${$e(i.ten)}</h3>${i.link ? `<a class="b" target="_blank" rel="noopener" href="${$e(i.link)}">Mở toàn màn hình</a>` : ''}</div>`
        + (i.link ? `<iframe src="${$e(i.link)}" style="width:100%;height:75vh;border:0;margin-top:10px;border-radius:10px;background:#fff"></iframe>` : i.nd ? van(i.nd) : '<div class="empty">Sách chưa có nội dung</div>') + '</div>';
      el.querySelector('#bk').onclick = () => SACH.view(el, ds);
    });
  }
};

/* Blog văn chương */
const BLOG = { key: 'blog', add: 'Viết bài mới', ngay: 1, hint: 'Cách đoạn bằng một dòng trống. Học sinh chỉ đọc.',
  f: [{ n: 'tieu', p: 'Tiêu đề bài viết' }, { n: 'nd', p: 'Nội dung bài viết', t: 1, h: 220 }],
  show: i => `<h3>${$e(i.tieu)}</h3><div class="sub">${$e(i.ngay)}</div>${van(i.nd)}` };

/* Giải đáp */
const HOIDAP = { key: 'hoidap', add: 'Thêm câu hỏi và giải đáp',
  f: [{ n: 'q', p: 'Câu hỏi' }, { n: 'a', p: 'Giải đáp của thầy', t: 1, h: 120 }],
  show: i => `<h3>❓ ${$e(i.q)}</h3>${van(i.a)}`,
  top: LIEN_HE ? `<div class="card row"><span class="g">Em có thắc mắc mới?</span><a class="b" target="_blank" rel="noopener" href="${$e(LIEN_HE)}">Gửi câu hỏi cho thầy</a></div>` : '' };

/* Quizz: mỗi dòng "Câu hỏi | A | B | C | D | số thứ tự đáp án đúng" */
const parse = s => String(s || '').split('\n').map(l => l.split('|').map(x => x.trim())).filter(p => p.length >= 4 && +p[p.length - 1] >= 1)
  .map(p => ({ q: p[0], a: p.slice(1, -1), d: +p[p.length - 1] - 1 }));
const QUIZ = { key: 'quiz', add: 'Tạo bài Quizz', hint: 'Mỗi dòng một câu: Câu hỏi | A | B | C | D | số thứ tự đáp án đúng. Ví dụ: Tác giả "Lão Hạc" là ai? | Nam Cao | Ngô Tất Tố | Tô Hoài | 1',
  f: [{ n: 'ten', p: 'Tên bài Quizz' }, { n: 'cau', p: 'Các câu hỏi (mỗi dòng một câu)', t: 1, h: 170 }],
  show: i => `<h3>${$e(i.ten)}</h3><div class="sub">${parse(i.cau).length} câu</div>`,
  view(el, ds) {
    el.innerHTML = ds.length ? ds.map(i => `<div class="card row"><div class="g"><h3>${$e(i.ten)}</h3><span class="sub">${parse(i.cau).length} câu</span></div><button class="b" data-q="${i.id}">Làm bài</button></div>`).join('') : trong('Chưa có bài Quizz');
    const lam = i => {
      const Q = parse(i.cau);
      el.innerHTML = `<div class="card"><div class="row"><button class="b s" id="bk">← Danh sách</button><h3>${$e(i.ten)}</h3></div></div>` + Q.map((q, n) => `<div class="card"><b>Câu ${n + 1}. ${$e(q.q)}</b>`
        + q.a.map((a, k) => `<div><label><input type="radio" name="q${n}" value="${k}"> ${$e(a)}</label></div>`).join('') + '</div>').join('')
        + '<div class="card row"><button class="b" id="nop">Nộp bài</button><b id="kq"></b></div>';
      el.querySelector('#bk').onclick = () => QUIZ.view(el, ds);
      el.querySelector('#nop').onclick = e => {
        let s = 0;
        Q.forEach((q, n) => { const L = [...el.querySelectorAll(`[name=q${n}]`)], c = L.find(x => x.checked), ok = c && +c.value === q.d; if (ok) s++;
          L[q.d].parentElement.style.color = '#15803d'; if (c && !ok) c.parentElement.style.color = 'var(--red)'; L.forEach(x => x.disabled = true); });
        el.querySelector('#kq').textContent = `Điểm: ${s}/${Q.length}`; e.target.textContent = 'Làm lại'; e.target.onclick = () => lam(i);
      };
    };
    el.querySelectorAll('[data-q]').forEach(b => b.onclick = () => lam(ds.find(x => x.id === b.dataset.q)));
  }
};

/* Quản lý lớp học */
function lop(el) {
  let ds = ld('lv_lop', []), loc = '';
  const ve = () => {
    const cl = [...new Set(ds.map(s => s.cls).filter(Boolean))].sort(), L = ds.filter(s => !loc || s.cls === loc);
    el.innerHTML = `<div class="card"><h3>Thêm học sinh</h3><div class="row" style="margin-top:8px"><input class="g" id="t" placeholder="Họ và tên"><input id="c" placeholder="Lớp" size="6"><input class="g" id="g" placeholder="Ghi chú"><button class="b" id="ad">Thêm</button></div></div>`
      + `<div class="card"><div class="row"><h3 class="g">Danh sách (${L.length})</h3><select id="lc"><option value="">Tất cả lớp</option>${cl.map(c => `<option ${c === loc ? 'selected' : ''}>${$e(c)}</option>`).join('')}</select></div>`
      + (L.length ? L.map(s => `<div class="row" style="${line}"><b class="g">${$e(s.ten)}</b><span class="sub">${$e(s.cls)}${s.gc ? ' · ' + $e(s.gc) : ''}</span><button class="b d" data-d="${s.id}">Xóa</button></div>`).join('') : '<div class="empty">Chưa có học sinh</div>') + '</div>'
      + '<div class="card"><h3>Sao lưu dữ liệu</h3><p class="sub">Sổ lớp, sổ nhắc việc, sổ gọi tên và bài đang soạn lưu trên trình duyệt này. Hãy tải bản sao lưu thường xuyên.</p><div class="row"><button class="b s" id="bu">Tải bản sao lưu</button><label class="b s">Khôi phục<input type="file" id="rs" accept=".json" hidden></label></div></div>';
    const q = s => el.querySelector(s);
    q('#ad').onclick = () => { const t = q('#t').value.trim(); if (!t) return; ds = [...ds, { id: uid(), ten: t, cls: q('#c').value.trim(), gc: q('#g').value.trim() }]; sv('lv_lop', ds); ve(); };
    q('#lc').onchange = e => { loc = e.target.value; ve(); };
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (confirm('Xóa học sinh này?')) { ds = ds.filter(s => s.id !== b.dataset.d); sv('lv_lop', ds); ve(); } });
    q('#bu').onclick = () => tai('sao-luu-lop-van.json', JSON.stringify(Object.fromEntries(['lv_lop', 'lv_nhac', 'lv_goi', 'lv_nd'].map(k => [k, ld(k, null)]))), 'application/json');
    q('#rs').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { try { const o = JSON.parse(r.result); ['lv_lop', 'lv_nhac', 'lv_goi', 'lv_nd'].forEach(k => o[k] != null && sv(k, o[k])); ds = ld('lv_lop', []); ve(); alert('Đã khôi phục dữ liệu'); } catch (x) { alert('Tệp sao lưu không hợp lệ'); } }; r.readAsText(f); };
  };
  ve();
}

/* Sổ nhắc việc */
function nhac(el) {
  let ds = ld('lv_nhac', []); const hn = hnay(), cap = () => { sv('lv_nhac', ds); ve(); };
  const ve = () => {
    const s = [...ds].sort((a, b) => a.xong - b.xong || (a.han || '9').localeCompare(b.han || '9'));
    el.innerHTML = '<div class="card"><h3>Thêm việc cần nhớ</h3><div class="row" style="margin-top:8px"><input class="g" id="t" placeholder="Việc cần làm"><input id="h" type="date"><button class="b" id="ad">Thêm</button></div></div><div class="card">'
      + (s.length ? s.map(i => `<div class="row" style="${line}"><label class="g"><input type="checkbox" data-k="${i.id}" ${i.xong ? 'checked' : ''}> <span style="${i.xong ? 'text-decoration:line-through;opacity:.55' : ''}">${$e(i.t)}</span></label><span class="${!i.xong && i.han && i.han <= hn ? 'x' : 'sub'}">${i.han ? i.han.split('-').reverse().join('/') : ''}</span><button class="b d" data-d="${i.id}">Xóa</button></div>`).join('') : '<div class="empty">Chưa có việc nào</div>') + '</div>';
    el.querySelector('#ad').onclick = () => { const t = el.querySelector('#t').value.trim(); if (!t) return; ds = [{ id: uid(), t, han: el.querySelector('#h').value, xong: false }, ...ds]; cap(); };
    el.querySelectorAll('[data-k]').forEach(c => c.onchange = () => { ds = ds.map(i => i.id === c.dataset.k ? { ...i, xong: c.checked } : i); cap(); });
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { ds = ds.filter(i => i.id !== b.dataset.d); cap(); });
  };
  ve();
}

/* Sổ gọi tên: gọi ngẫu nhiên, ưu tiên em được gọi ít nhất */
function goiten(el) {
  const hs = ld('lv_lop', []); let g = ld('lv_goi', {}), loc = '', cur = null;
  const n = s => g[s.id] || { n: 0, d: 0 };
  const ve = () => {
    if (!hs.length) { el.innerHTML = trong('Hãy thêm học sinh ở mục Quản lý lớp học trước'); return; }
    const cl = [...new Set(hs.map(s => s.cls).filter(Boolean))].sort(), L = hs.filter(s => !loc || s.cls === loc);
    el.innerHTML = `<div class="card"><div class="row"><select id="lc"><option value="">Tất cả lớp</option>${cl.map(c => `<option ${c === loc ? 'selected' : ''}>${$e(c)}</option>`).join('')}</select><button class="b" id="go">🎲 Gọi tên</button><button class="b d" id="rs">Đặt lại số liệu</button></div>`
      + (cur ? `<div style="text-align:center;padding:22px 0"><div style="font-size:34px;font-weight:700">${$e(cur.ten)}</div><div class="sub">${$e(cur.cls)}</div><div class="row" style="justify-content:center;margin-top:12px"><button class="b" data-r="1">Trả lời tốt</button><button class="b s" data-r="0">Chưa tốt</button></div></div>` : '')
      + '</div><div class="card"><h3>Thống kê</h3>' + L.map(s => `<div class="row" style="${line}"><b class="g">${$e(s.ten)}</b><span class="sub">${$e(s.cls)}</span><span>Gọi ${n(s).n} · Tốt ${n(s).d}</span></div>`).join('') + '</div>';
    const q = s => el.querySelector(s);
    q('#lc').onchange = e => { loc = e.target.value; cur = null; ve(); };
    q('#go').onclick = () => { if (!L.length) return; const m = Math.min(...L.map(s => n(s).n)), p = L.filter(s => n(s).n === m); cur = p[Math.floor(Math.random() * p.length)]; ve(); };
    q('#rs').onclick = () => { if (confirm('Xóa toàn bộ số liệu gọi tên?')) { g = {}; sv('lv_goi', g); cur = null; ve(); } };
    el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const r = n(cur); g[cur.id] = { n: r.n + 1, d: r.d + +b.dataset.r }; sv('lv_goi', g); cur = null; ve(); });
  };
  ve();
}

const CHUNG = ['gv', 'hs'], vao = c => (el, u) => crud(el, u, c);
window.TRANG = [
  { id: 'home', icon: '🏠', title: 'Tổng quan', roles: CHUNG,
    render(el, user) {
      el.innerHTML = `<section class="hero"><div><p>${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h2>Xin chào, ${$e(user.name)}</h2><p>${user.role === 'gv' ? 'Bạn đang đăng nhập với tư cách giáo viên' : 'Bạn đang đăng nhập với tư cách học sinh lớp ' + $e(user.cls)}</p></div></section>`;
    } },
  { id: 'lop', icon: '🏫', title: 'Quản lý lớp học', roles: ['gv'], render: lop },
  { id: 'nhac', icon: '🗒️', title: 'Sổ nhắc việc', roles: ['gv'], render: nhac },
  { id: 'goiten', icon: '🎲', title: 'Sổ gọi tên', roles: ['gv'], render: goiten },
  { id: 'sach', icon: '📚', title: 'Đọc sách cùng thầy Hiếu', roles: CHUNG, render: vao(SACH) },
  { id: 'blog', icon: '✍️', title: 'Blog văn chương', roles: CHUNG, render: vao(BLOG) },
  { id: 'quiz', icon: '🧩', title: 'Quizz', roles: CHUNG, render: vao(QUIZ) },
  { id: 'hoidap', icon: '💬', title: 'Giải đáp thắc mắc cùng thầy Hiếu', roles: CHUNG, render: vao(HOIDAP) }
];
})();
