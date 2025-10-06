# language: vi
Tính năng: Quản lý Phòng/Bàn và Hàng hóa

  Bối cảnh:
    Cho trước người dùng đã đăng nhập MHQL thành công

  Kịch bản: Thêm mới phòng bàn thành công
    Khi người dùng vào menu "Phòng/Bàn"
    Và người dùng thêm mới bàn với thông tin:
      | Tên bàn   | Nhóm    | Vị trí | Số ghế | Ghi chú  |
      | Bàn 1     | Nhóm 1  | 1      | 4      | Bàn test |
    Thì hệ thống hiển thị bàn "Bàn 1" trong danh sách

  Kịch bản: Cập nhật phòng bàn thành công
    Khi người dùng vào menu "Phòng/Bàn"
    Và người dùng cập nhật tên bàn thành "Bàn 1 update"
    Thì hệ thống hiển thị bàn "Bàn 1 update" trong danh sách

  Kịch bản: Xóa phòng bàn thành công
    Khi người dùng vào menu "Phòng/Bàn"
    Và người dùng xóa bàn "Bàn 1 update"
    Thì hệ thống không hiển thị bàn "Bàn 1 update" trong danh sách

  Kịch bản: Thêm mới hàng hóa thành công
    Khi người dùng vào menu "Hàng hóa"
    Và người dùng vào tab "Danh mục"
    Và người dùng thêm mới hàng hóa "Hàng hóa 1" thuộc nhóm "Nhóm hàng 1" với giá "10000"
    Thì hệ thống hiển thị hàng hóa "Hàng hóa 1" trong danh sách

  Kịch bản: Cập nhật hàng hóa thành công
    Khi người dùng vào menu "Hàng hóa"
    Và người dùng vào tab "Danh mục"
    Và người dùng cập nhật hàng hóa "Hàng hóa 1" thành "Hàng hóa 1 update"
    Thì hệ thống hiển thị hàng hóa "Hàng hóa 1 update" trong danh sách

  Kịch bản: Xóa hàng hóa thành công
    Khi người dùng vào menu "Hàng hóa"
    Và người dùng vào tab "Danh mục"
    Và người dùng xóa hàng hóa "Hàng hóa 1 update"
    Thì hệ thống không hiển thị hàng hóa "Hàng hóa 1 update" trong danh sách
