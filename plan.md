# 📌 KẾ HOẠCH DỰ ÁN: NỀN TẢNG ĐIỂM DANH & QUẢN TRỊ SỰ KIỆN MỞ

> **Định hướng kiến trúc:** Xây dựng dưới dạng **Hệ thống mô-đun (Modular Platform)**. Phiên bản hiện tại tập trung phát triển mô-đun cốt lõi: **Điểm danh mở bằng Tọa độ (Map/GPS) + Mã QR + Mã số động + Form tùy biến + Xuất Excel**. Các mô-đun khác (biểu quyết, tài liệu, quản lý thành viên) sẽ được tích hợp nối tiếp trên cùng một khung cấu trúc.

---

## 🏗 1. ĐỊNH HƯỚNG KIẾN TRÚC MỞ (EXTENSIBLE ARCHITECTURE)

Để đảm bảo dễ dàng mở rộng nhiều tính năng sau này, hệ thống tuân theo các nguyên tắc:

* **Next.js Modular Directory:** Tổ chức mã nguồn theo mô-đun nghiệp vụ (Feature-based folder structure). Mỗi tính năng độc lập về giao diện, API và logic.
* **Cơ sở dữ liệu linh hoạt với PostgreSQL JSONB:** Sử dụng kiểu dữ liệu `JSONB` của PostgreSQL (trên Supabase) để lưu cấu hình tính năng và các trường dữ liệu tùy biến mà không cần phải thay đổi cấu trúc bảng (Schema migration) mỗi khi thêm tính năng mới.
* **Plugin/Feature Flag System:** Bảng `events` quản lý các tính năng được bật/tắt (ví dụ: `features: { checkin: true, voting: false, documents: false }`).

---

## 📋 2. ĐẶC TẢ CHI TIẾT PHÂN HỆ ĐIỂM DANH (CURRENT FEATURE)

### A. Phía Người chủ trì (Host / Admin)
1. **Thiết lập vị trí điểm danh (2 lựa chọn):**
   * *Cách 1 (Nhanh):* Bấm nút *"Lấy vị trí hiện tại của tôi"* (dùng GPS của trình duyệt).
   * *Cách 2 (Trực quan):* Mở bản đồ tương tác (OpenStreetMap / Leaflet - 0 đồng), ghim vị trí tổ chức và chọn bán kính cho phép (ví dụ: 50m, 100m, 200m).
2. **Cấu hình Form thông tin người tham dự (Custom Dynamic Fields):**
   * Vì không có danh sách nạp trước, Host được quyền cấu hình các câu hỏi/thông tin cần thu thập khi check-in (ví dụ: *Họ tên [bắt buộc]*, *Số điện thoại*, *Đơn vị công tác*, *Chức vụ*, *Ghi chú*...).
3. **Màn hình điều khiển sự kiện (Host Control Screen / Máy chiếu):**
   * **Hiển thị Mã QR:** Dẫn trực tiếp tới trang check-in của phiên đó.
   * **Mã số ngẫu nhiên đổi liên tục (Dynamic PIN/OTP):** Màn hình hiển thị một mã số ngẫu nhiên (ví dụ 4 số: `4829`) tự động đổi sau mỗi 30–60 giây (đồng bộ qua Supabase Realtime). Người tham gia bắt buộc phải nhìn thấy mã này mới nhập được.
   * **Danh sách thời gian thực:** Nhảy tên người vừa điểm danh kèm mốc thời gian.
4. **Tổng kết & Xuất báo cáo:**
   * Bấm nút **"Xuất file Excel (.xlsx)"**: Tự động tổng hợp đầy đủ họ tên, các trường tùy chỉnh, thời gian check-in chính xác và khoảng cách tọa độ thực tế.

### B. Phía Người tham dự (Attendee Flow)
1. Dùng điện thoại quét mã QR $\rightarrow$ Trình duyệt mở trang web check-in.
2. Trình duyệt yêu cầu cấp quyền vị trí $\rightarrow$ Lấy tọa độ GPS người dùng.
3. Người dùng nhập:
   * Họ và tên.
   * Các trường thông tin tùy chỉnh do Host yêu cầu.
   * **Mã số ngẫu nhiên** đang hiển thị trên màn hình của Host.
4. Bấm **"Xác nhận có mặt"**:
   * Hệ thống tính khoảng cách giữa người dùng và vị trí đã ghim.
   * Kiểm tra mã ngẫu nhiên có hợp lệ trong chu kỳ thời gian hay không.
   * Nếu hợp lệ: Báo thành công và khóa thiết bị không cho gửi trùng.

---

## 🗄 3. THIẾT KẾ CƠ SỞ DỮ LIỆU MỞ (SUPABASE / POSTGRESQL)

```sql
-- 1. BẢNG SỰ KIỆN / PHIÊN HỌP (Mở rộng cho nhiều tính năng)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'closed'
  
  -- Cấu hình vị trí (Module Geofencing)
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  radius_meters INT DEFAULT 100,
  
  -- Cấu hình động cho các tính năng tương lai (JSONB)
  -- Ví dụ: {"voting_enabled": false, "doc_sharing": false}
  module_settings JSONB DEFAULT '{}',
  
  -- Cấu hình các trường thông tin cần nhập (Dynamic Fields Form)
  -- Ví dụ: [{"key": "phone", "label": "Số điện thoại", "type": "text", "required": true}]
  custom_fields JSONB DEFAULT '[]'
);

-- 2. BẢNG MÃ SỐ NGẪU NHIÊN ĐỔI THEO THỜI GIAN (Dynamic PIN)
CREATE TABLE event_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  current_pin VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG DỮ LIỆU ĐIỂM DANH (Lưu trữ linh hoạt dữ liệu tùy biến)
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  
  -- Dữ liệu tùy biến người dùng nhập theo custom_fields
  -- Ví dụ: {"phone": "0912345678", "don_vi": "Phòng Kế hoạch"}
  custom_data JSONB DEFAULT '{}',
  
  -- Dữ liệu xác thực vị trí & thiết bị
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  device_id VARCHAR(255),
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Realtime cho 2 bảng này trên Supabase Dashboard:
-- 1. event_pins (để màn hình và client đồng bộ mã PIN)
-- 2. attendance_records (để màn hình Host tự cập nhật số lượng)