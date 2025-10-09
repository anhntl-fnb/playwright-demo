Feature: Thanh toán đơn hàng tại Màn hình bán hàng

  Background:
    Given người dùng đã đăng nhập MHBH thành công
    And hệ thống đã tạo dữ liệu test gồm danh mục và sản phẩm

  Scenario: Thanh toán đơn hàng thành công
    When người dùng vào menu "Thực đơn"
    And người dùng chờ sản phẩm test hiển thị trên giao diện
    And người dùng tạo hóa đơn với sản phẩm test
    Then hệ thống tạo hóa đơn thành công
    And hóa đơn được xác thực qua API
    And dữ liệu test được xóa sau khi hoàn thành
