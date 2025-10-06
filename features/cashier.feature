# language: vi
Tính năng: Thanh toán đơn hàng tại Màn hình bán hàng

  Bối cảnh:
    Cho trước người dùng đã đăng nhập MHBH thành công
    Và hệ thống đã tạo dữ liệu test gồm danh mục và sản phẩm

  Kịch bản: Thanh toán đơn hàng thành công
    Khi người dùng vào menu "Thực đơn"
    Và người dùng chờ sản phẩm test hiển thị trên giao diện
    Và người dùng tạo hóa đơn với sản phẩm test
    Thì hệ thống tạo hóa đơn thành công
    Và hóa đơn được xác thực qua API
    Và dữ liệu test được xóa sau khi hoàn thành
