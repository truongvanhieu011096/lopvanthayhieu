/* Supabase sync for Lớp văn thầy Hiếu — only on supabase-integration branch. */
(() => {
  const URL = 'https://yxinctjazrmpjqjcrdnz.supabase.co';
  const KEY = 'sb_publishable_MqWXgrlHm8eLh0cg1-nsDQ_ILfhP7yH';
  const TABLES = { lv_lop: 'lop_hoc', lv_nhac: 'nhac_viec', lv_goi: 'goi_ten', lv_nd: 'noi_dung' };
  if (!window.supabase?.createClient) return;
  const sb = window.supabase.createClient(URL, KEY);
  let user = null, busy = false;
  let enabled = localStorage.getItem('lv_cloud_ready') === '1';
  const status = (s, bad = false) => {
    const el = document.getElementById('lv-cloud-status');
    if (el) { el.textContent = s; el.style.color = bad ? '#b91c1c' : 'var(--mut,#58738a)'; }
  };
  const localData = k => {
    try {
      const raw = localStorage.getItem(k);
      if (raw != null) return JSON.parse(raw);
    } catch (e) {}
    if (k === 'lv_nd') return window.LV_NOIDUNG || { sach: [], blog: [], quiz: [], hoidap: [] };
    return k === 'lv_goi' ? {} : [];
  };
  async function push(k, val) {
    if (!user || !enabled || busy || !TABLES[k]) return;
    const { error } = await sb.from(TABLES[k]).upsert({
      owner_id: user.id, du_lieu: val, updated_at: new Date().toISOString()
    }, { onConflict: 'owner_id' });
    if (error) throw error;
  }
  const timers = {};
  function schedule(k, val) {
    if (!enabled || !user || !TABLES[k] || busy) return;
    clearTimeout(timers[k]);
    timers[k] = setTimeout(async () => {
      try { await push(k, val); status('Đã tự động đồng bộ dữ liệu lên Supabase.'); }
      catch (e) { status('Lỗi đồng bộ: ' + (e.message || 'Không rõ nguyên nhân'), true); }
    }, 800);
  }
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(k, v) {
    originalSetItem.call(this, k, v);
    if (this === localStorage && TABLES[k]) {
      try { schedule(k, JSON.parse(v)); } catch (e) {}
    }
  };
  async function uploadAll() {
    if (!user) throw new Error('Hãy kết nối tài khoản Supabase trước.');
    busy = true;
    try {
      for (const k of Object.keys(TABLES)) {
        const { error } = await sb.from(TABLES[k]).upsert({
          owner_id: user.id, du_lieu: localData(k), updated_at: new Date().toISOString()
        }, { onConflict: 'owner_id' });
        if (error) throw error;
      }
      localStorage.setItem('lv_cloud_ready', '1'); enabled = true;
    } finally { busy = false; }
  }
  async function downloadAll() {
    if (!user) throw new Error('Hãy kết nối tài khoản Supabase trước.');
    const found = {};
    for (const k of Object.keys(TABLES)) {
      const { data, error } = await sb.from(TABLES[k]).select('du_lieu').eq('owner_id', user.id).maybeSingle();
      if (error) throw error;
      if (data && data.du_lieu != null) found[k] = data.du_lieu;
    }
    if (!Object.keys(found).length) throw new Error('Chưa có dữ liệu trên Supabase cho tài khoản này. Hãy dùng “Đưa dữ liệu trình duyệt lên” trong lần đầu.');
    busy = true;
    try {
      for (const [k, v] of Object.entries(found)) localStorage.setItem(k, JSON.stringify(v));
      localStorage.setItem('lv_cloud_ready', '1'); enabled = true;
    } finally { busy = false; }
  }
  async function loadPublicContent() {
    try {
      const { data, error } = await sb.from('noi_dung').select('du_lieu,updated_at').order('updated_at', { ascending: false }).limit(1);
      if (!error && data?.length && data[0].du_lieu) {
        window.LV_NOIDUNG = { ...(window.LV_NOIDUNG || {}), ...data[0].du_lieu };
      }
    } catch (e) {}
  }
  async function connectPanel(panel) {
    const email = panel.querySelector('#lv-cloud-email').value.trim();
    const password = panel.querySelector('#lv-cloud-password').value;
    if (!email || !password) return status('Nhập email và mật khẩu Supabase.', true);
    status('Đang kết nối Supabase…');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return status('Kết nối thất bại: ' + error.message, true);
    user = data.user;
    panel.querySelector('#lv-cloud-password').value = '';
    status('Đã kết nối: ' + (user.email || 'tài khoản Supabase') + (enabled ? ' · Tự động đồng bộ đang bật.' : ' · Chưa bật đồng bộ tự động.'));
  }
  function mount() {
    let me = null;
    try { me = JSON.parse(sessionStorage.getItem('lvu')); } catch (e) {}
    const view = document.getElementById('view');
    if (!view || !me || me.role !== 'gv' || document.getElementById('lv-cloud-panel')) return;
    const panel = document.createElement('section');
    panel.id = 'lv-cloud-panel';
    panel.className = 'card';
    panel.innerHTML = '<h3>Đồng bộ dữ liệu Supabase</h3>' +
      '<p class="sub">Kết nối tài khoản Supabase đã tạo. Lần đầu, hãy chọn rõ dữ liệu cần đưa lên hoặc tải xuống.</p>' +
      '<div class="row" style="margin-top:10px"><input class="g" id="lv-cloud-email" type="email" autocomplete="username" placeholder="Email Supabase"><input class="g" id="lv-cloud-password" type="password" autocomplete="current-password" placeholder="Mật khẩu Supabase"><button class="b" id="lv-cloud-connect">Kết nối</button></div>' +
      '<div class="row" style="margin-top:10px"><button class="b s" id="lv-cloud-upload">Đưa dữ liệu trình duyệt lên</button><button class="b s" id="lv-cloud-download">Tải dữ liệu từ Supabase xuống</button><button class="b d" id="lv-cloud-disconnect">Ngắt kết nối</button></div>' +
      '<div id="lv-cloud-status" class="sub" style="margin-top:8px">Đang kiểm tra phiên Supabase…</div>' +
      '<p class="sub">Lưu ý: tải lên sẽ thay thế dữ liệu đám mây của tài khoản này; tải xuống sẽ thay thế các mục tương ứng trên trình duyệt. Nên tải bản sao lưu trước khi chọn.</p>';
    view.appendChild(panel);
    sb.auth.getSession().then(({ data }) => {
      user = data?.session?.user || null;
      status(user ? 'Đã kết nối: ' + (user.email || 'tài khoản Supabase') + (enabled ? ' · Tự động đồng bộ đang bật.' : ' · Chưa bật đồng bộ tự động.') : 'Chưa kết nối tài khoản Supabase.');
    }).catch(e => status(e.message, true));
    panel.querySelector('#lv-cloud-connect').onclick = () => connectPanel(panel).catch(e => status(e.message, true));
    panel.querySelector('#lv-cloud-upload').onclick = async () => {
      if (!user) return status('Hãy kết nối Supabase trước.', true);
      if (!confirm('Thao tác này sẽ ghi đè dữ liệu Supabase bằng dữ liệu trên trình duyệt này. Thầy đã sao lưu và chọn đúng bản dữ liệu chưa?')) return;
      status('Đang tải dữ liệu lên…');
      try { await uploadAll(); status('Đã tải dữ liệu lên. Những thay đổi tiếp theo sẽ tự động đồng bộ.'); }
      catch (e) { status('Tải lên thất bại: ' + (e.message || 'Lỗi'), true); }
    };
    panel.querySelector('#lv-cloud-download').onclick = async () => {
      if (!user) return status('Hãy kết nối Supabase trước.', true);
      if (!confirm('Dữ liệu trên Supabase sẽ thay thế dữ liệu tương ứng trên trình duyệt này. Thầy đã sao lưu dữ liệu hiện tại chưa?')) return;
      status('Đang tải dữ liệu xuống…');
      try { await downloadAll(); status('Đã tải dữ liệu xuống thành công. Hãy chọn lại mục cần xem để làm mới dữ liệu hiển thị. Những thay đổi tiếp theo sẽ tự động đồng bộ.'); }
      catch (e) { status('Tải xuống thất bại: ' + (e.message || 'Lỗi'), true); }
    };
    panel.querySelector('#lv-cloud-disconnect').onclick = async () => {
      await sb.auth.signOut(); user = null; enabled = false; localStorage.removeItem('lv_cloud_ready');
      status('Đã ngắt kết nối Supabase. Dữ liệu trên trình duyệt vẫn được giữ.');
    };
  }
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  sb.auth.getSession().then(({ data }) => { user = data?.session?.user || null; });
  loadPublicContent();
})();