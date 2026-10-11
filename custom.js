/* File chức năng của thầy: mỗi phần tử là một mục trên thanh bên.
   render(el, user) nhận vùng nội dung (el) và tài khoản đang đăng nhập (user).
   roles: ['gv'] chỉ giáo viên thấy, ['hs'] chỉ học sinh, ['gv','hs'] cả hai. Không ghi roles thì chỉ giáo viên thấy.
   user.role là 'gv' hoặc 'hs'; user.admin là true nếu là quản trị viên; học sinh có thêm user.cls (lớp).
   Lưu ý: roles chỉ ẩn mục trên màn hình, không giấu được nội dung trong file này. */
window.TRANG = [
  {
    id: 'home', icon: '🏠', title: 'Tổng quan', roles: ['gv', 'hs'],
    render(el, user) {
      el.innerHTML = `<section class="hero"><div><p>${new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long'})}</p>
        <h2>Xin chào, ${user.name}</h2><p>${user.role === 'gv' ? 'Bạn đang đăng nhập với tư cách giáo viên' : 'Bạn đang đăng nhập với tư cách học sinh lớp ' + user.cls}</p></div></section>`;
    }
  },
  {
    id: 'demo', icon: '📝', title: 'Dành cho giáo viên',
    render(el) {
      el.innerHTML = `<div class="card"><h3>Ví dụ một mục</h3><p class="sub">Dùng class card, b (nút), sub, row để có đúng giao diện.</p>
        <div class="row"><input class="g" id="x" placeholder="Nhập gì đó"><button class="b" id="go">Bấm thử</button></div><div id="out" class="sub" style="margin-top:8px"></div></div>`;
      el.querySelector('#go').onclick = () => { el.querySelector('#out').textContent = 'Bạn đã nhập: ' + el.querySelector('#x').value; };
    }
  }
];
