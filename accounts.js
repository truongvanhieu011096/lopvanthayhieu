/* Danh sách tài khoản.
   Chỉ lưu MÃ BĂM (SHA-256), không lưu mật khẩu thật.
   users = giáo viên (admin: true là quản trị viên), students = học sinh (cls là lớp của em).
   Thêm tài khoản: mở tao-ma.html, nhập thông tin, chép dòng kết quả vào danh sách tương ứng.
   Nếu đổi salt thì phải tạo lại mã băm của TẤT CẢ tài khoản.
   Tài khoản học sinh mẫu hocsinh1 / matkhau123: hãy xóa trước khi dùng thật. */
window.LV_ACCOUNTS = {
  salt: 'lvth-7f3a91c2',
  users: [
    { id: 'thayhieu', name: 'Thầy Hiếu', admin: true, hash: 'b95b687f518384f070ab7489ea66d013605a0e97c84e996b5a1391889d73705e' },
    { id: 'thayhieu1', name: 'Tiểu Thái Dương | Trợ lý thầy Hiếu', hash: '6c8b41612fe2b4b1a6ea329dc1ea424387bc59d7d60c9cfcb19028d1b65baf32' }
  ],
  students: [
    { id: 'hocsinh1', name: 'Học sinh mẫu', cls: '8A', hash: 'f7c84cff78909deb32d01cb09e6f15dc802e13548e5d922e86b4fd388ccba856' }
    { id: 'tchnhien', name: 'Trương Cung Hạo Nhiên', cls: '1/4', hash: 'bd056460c1ca7c782a9dd8c43719c1b44d8cc0a8d17cdf39fa59ae59d6d8e045' },
  ]
};
