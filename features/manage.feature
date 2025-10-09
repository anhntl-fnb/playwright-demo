Feature: Quản lý Phòng/Bàn và Hàng hóa

  Background:
    Given người dùng đã đăng nhập MHQL thành công

  Scenario: Thêm mới phòng bàn thành công
    When người dùng vào menu "Phòng/Bàn"
    And người dùng thêm mới bàn với thông tin:
      | Tên bàn   | Nhóm    | Vị trí | Số ghế | Ghi chú  |
      | Bàn 1     | Nhóm 1  | 1      | 4      | Bàn test |
    Then hệ thống hiển thị bàn "Bàn 1" trong danh sách

  Scenario: Cập nhật phòng bàn thành công
    When người dùng vào menu "Phòng/Bàn"
    And người dùng cập nhật tên bàn thành "Bàn 1 update"
    Then hệ thống hiển thị bàn "Bàn 1 update" trong danh sách

  Scenario: Xóa phòng bàn thành công
    When người dùng vào menu "Phòng/Bàn"
    And người dùng xóa bàn "Bàn 1 update"
    Then hệ thống không hiển thị bàn "Bàn 1 update" trong danh sách

  Scenario: Thêm mới hàng hóa thành công
    When người dùng vào menu "Hàng hóa"
    And người dùng vào tab "Danh mục"
    And người dùng thêm mới hàng hóa "Hàng hóa 1" thuộc nhóm "Nhóm hàng 1" với giá "10000"
    Then hệ thống hiển thị hàng hóa "Hàng hóa 1" trong danh sách

  Scenario: Cập nhật hàng hóa thành công
    When người dùng vào menu "Hàng hóa"
    And người dùng vào tab "Danh mục"
    And người dùng cập nhật hàng hóa "Hàng hóa 1" thành "Hàng hóa 1 update"
    Then hệ thống hiển thị hàng hóa "Hàng hóa 1 update" trong danh sách

  Scenario: Xóa hàng hóa thành công
    When người dùng vào menu "Hàng hóa"
    And người dùng vào tab "Danh mục"
    And người dùng xóa hàng hóa "Hàng hóa 1 update"
    Then hệ thống không hiển thị hàng hóa "Hàng hóa 1 update" trong danh sách
