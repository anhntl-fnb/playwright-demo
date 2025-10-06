# language: vi
Tính năng: Đăng nhập hệ thống KiotViet F&B

  Bối cảnh:
    Cho trước người dùng đang ở trang đăng nhập

  Kịch bản: Đăng nhập Màn hình quản lý thành công
    Khi người dùng đăng nhập MHQL với thông tin hợp lệ
    Thì hệ thống hiển thị trang "Tổng quan"

  Kịch bản: Đăng nhập Màn hình bán hàng thành công
    Khi người dùng đăng nhập MHBH với thông tin hợp lệ
    Thì hệ thống hiển thị trang "Phòng bàn"

  Kịch bản: Không nhập tên đăng nhập
    Khi người dùng đăng nhập với tên cửa hàng "testfnbz27b" và mật khẩu "123" nhưng bỏ trống tên đăng nhập
    Thì hệ thống hiển thị lỗi "Bạn hãy nhập đầy đủ thông tin các trường"

  Kịch bản: Không nhập mật khẩu
    Khi người dùng đăng nhập với tên cửa hàng "testfnbz27b" và tên đăng nhập "anhntl" nhưng bỏ trống mật khẩu
    Thì hệ thống hiển thị lỗi "Bạn hãy nhập đầy đủ thông tin các trường"

  Kịch bản: Đăng nhập với thông tin sai
    Khi người dùng đăng nhập với tên cửa hàng "testfnbz27b" và tên đăng nhập "admin" và mật khẩu "1234"
    Thì hệ thống hiển thị lỗi "Tên đăng nhập hoặc mật khẩu chưa đúng"
