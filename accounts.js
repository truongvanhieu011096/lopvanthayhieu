/* Danh sách tài khoản.
   Chỉ lưu MÃ BĂM (SHA-256), không lưu mật khẩu thật.
   users = giáo viên (admin: true là quản trị viên), students = học sinh (cls là lớp của em).
   Thêm tài khoản: mở tao-ma.html, nhập thông tin, chép dòng kết quả vào danh sách tương ứng.
   Nếu đổi salt thì phải tạo lại mã băm của TẤT CẢ tài khoản.
   Tài khoản học sinh mẫu hocsinh1 / matkhau123: hãy xóa trước khi dùng thật. */
window.LV_ACCOUNTS = {
  salt: 'lvth-7f3a91c2',
  users: [
    { id: 'thayhieu', name: 'Thầy Hiếu', admin: true, hash: 'b95b687f518384f070ab7489ea66d013605a0e97c84e996b5a1391889d73705e' }
  ],
  students: [
    { id: 'hocsinh1', name: 'Học sinh mẫu', cls: '8A', hash: 'f7c84cff78909deb32d01cb09e6f15dc802e13548e5d922e86b4fd388ccba856' }
  ]
};
{ id: 'thayhieu1', name: 'Tiểu Thái Dương | Trợ lý thầy Hiếu', hash: 'f7b45d8f1fa9a650bc25996758fccf2330a844f53834f4c3e68f5cf986a03ef1' },