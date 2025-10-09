Feature: Đăng nhập hệ thống KiotViet F&B

  Background:
    Given người dùng đang ở trang đăng nhập

  Scenario: Đăng nhập Màn hình quản lý thành công
    When người dùng đăng nhập MHQL với thông tin hợp lệ
    Then hệ thống hiển thị trang "Tổng quan"

  Scenario: Đăng nhập Màn hình bán hàng thành công
    When người dùng đăng nhập MHBH với thông tin hợp lệ
    Then hệ thống hiển thị trang "Phòng bàn"

  Scenario: Không nhập tên đăng nhập
    When người dùng đăng nhập với tên cửa hàng "testfnbz27b" và mật khẩu "123" nhưng bỏ trống tên đăng nhập
    Then hệ thống hiển thị lỗi "Bạn hãy nhập đầy đủ thông tin các trường"

  Scenario: Không nhập mật khẩu
    When người dùng đăng nhập với tên cửa hàng "testfnbz27b" và tên đăng nhập "anhntl" nhưng bỏ trống mật khẩu
    Then hệ thống hiển thị lỗi "Bạn hãy nhập đầy đủ thông tin các trường"

  Scenario: Đăng nhập với thông tin sai
    When người dùng đăng nhập với tên cửa hàng "testfnbz27b" và tên đăng nhập "admin" và mật khẩu "1234"
    Then hệ thống hiển thị lỗi "Tên đăng nhập hoặc mật khẩu chưa đúng"
