# 📌 KẾ HOẠCH DỰ ÁN: ỨNG DỤNG ĐIỂM DANH THÔNG MINH (GEODAT / CÓ MẶT)

> **Mục tiêu:** Xây dựng ứng dụng web điểm danh cuộc họp/công sở kết hợp **Mã QR** và **Bán kính vị trí (GPS/Geofencing)**, tối ưu tốc độ thao tác (dưới 5 giây), giao diện thân thiện với cán bộ và chống gian lận hiệu quả.

---

## 🛠 1. TECH STACK & CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ | Chi tiết sử dụng |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | TypeScript, Server Actions / Route Handlers |
| **Styling** | **Tailwind CSS + Lucide Icons** | Giao diện Mobile-first, nhẹ, font chữ to rõ ràng |
| **Database** | **Supabase (PostgreSQL)** | Lưu trữ dữ liệu, Realtime Channel (đồng bộ tức thì) |
| **QR Engine** | `html5-qrcode` & `qrcode.react` | Quét mã bằng camera điện thoại và tạo mã hiển thị |
| **Định vị** | Web Geolocation API + Haversine | Lấy tọa độ và tính khoảng cách bán kính (mét) |
| **Hosting & Cloud** | **Vercel** + **Supabase Cloud** | Tích hợp sẵn HTTPS miễn phí, Deploy qua GitHub |

---

## 🏗 2. KIẾN TRÚC DỮ LIỆU (DATABASE SCHEMA - SUPABASE)

### 2.1. Bảng `events` (Danh sách cuộc họp/sự kiện)
* `id` (UUID, Primary Key)
* `title` (TEXT): Tên cuộc họp (ví dụ: "Họp giao ban tháng 10")
* `target_lat` (FLOAT): Vĩ độ phòng họp
* `target_lng` (FLOAT): Kinh độ phòng họp
* `radius_meters` (INT): Bán kính cho phép (mặc định: 70m - 100m)
* `pin_code` (VARCHAR): Mã PIN xác thực nhanh (4 số)
* `is_active` (BOOLEAN): Trạng thái mở/đóng điểm danh
* `created_at` (TIMESTAMPTZ)

### 2.2. Bảng `attendees` (Danh sách triệu tập)
* `id` (UUID, Primary Key)
* `event_id` (UUID, Foreign Key -> `events.id`)
* `full_name` (TEXT): Họ và tên cán bộ
* `code` (TEXT): Mã cán bộ / 3 số cuối CCCD
* `department` (TEXT): Phòng ban / Đơn vị
* `status` (VARCHAR): `'CHUA_DEN'` | `'DA_DEN'` | `'DEN_MUON'`

### 2.3. Bảng `checkin_logs` (Nhật ký điểm danh thực tế)
* `id` (UUID, Primary Key)
* `event_id` (UUID, Foreign Key)
* `attendee_id` (UUID, Foreign Key)
* `device_fingerprint` (TEXT): Mã định danh thiết bị (chống 1 máy bấm hộ)
* `user_lat` (FLOAT): Vĩ độ lúc bấm
* `user_lng` (FLOAT): Kinh độ lúc bấm
* `distance_meters` (INT): Khoảng cách thực tế so với hội trường
* `created_at` (TIMESTAMPTZ): Thời điểm điểm danh chính xác

---

## 📱 3. LUỒNG NGHIỆP VỤ & TRẢI NGHIỆM NGƯỜI DÙNG (USER FLOW)

### Luồng 1: Cán bộ tham dự (Thao tác trên Mobile Web)
1. **Quét mã:** Quét mã QR tại cửa hội trường hoặc bàn họp $\rightarrow$ Mở trang Web `https://domain.com/checkin/[event_id]`.
2. **Cấp quyền:** Trình duyệt xin quyền Vị trí (GPS).
3. **Nhập định danh:** 
   * Gõ 2 ký tự tên hoặc Mã cán bộ (hệ thống tự gợi ý tên).
   * Nhập mã PIN 4 số (chiếu trên màn hình hội trường).
4. **Xác thực tự động:**
   * Tính khoảng cách: Nếu $> 100\text{m}$ $\rightarrow$ Báo đỏ: *"Bạn đang cách phòng họp X mét"*.
   * Kiểm tra máy: Nếu máy này đã điểm danh cho người khác $\rightarrow$ Báo chặn gian lận.
5. **Thành công:** Màn hình xanh hiện *"Xác nhận có mặt thành công"*.

### Luồng 2: Thư ký / Quản trị viên (Màn hình máy tính / Máy chiếu)
1. Tạo cuộc họp mới, thiết lập vị trí và tải file Excel danh sách triệu tập lên.
2. Bật trang **Dashboard Máy chiếu**: Hiển thị mã QR lớn, mã PIN 4 số và tỷ lệ quân số real-time (`28/30 đồng chí`).
3. Xuất file báo cáo Excel sau khi kết thúc cuộc họp.

---

## 📅 4. LỘ TRÌNH THỰC HIỆN CHI TIẾT (5 GIAI ĐOẠN)

### GIAI ĐOẠN 1: Khởi tạo & Thiết kế Dữ liệu (Ngày 1 - 2)
- [ ] Khởi tạo dự án: `npx create-next-app@latest --typescript --tailwind --app`.
- [ ] Cài đặt các thư viện phụ trợ: `@supabase/supabase-js`, `lucide-react`, `html5-qrcode`, `geolib`.
- [ ] Tạo Project trên Supabase, chạy script SQL tạo 3 bảng (`events`, `attendees`, `checkin_logs`).
- [ ] Thiết lập biến môi trường `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`).

### GIAI ĐOẠN 2: Phát triển Core Check-in & Logic Vị trí (Ngày 3 - 4)
- [ ] Xây dựng giao diện trang `/checkin/[id]` (Mobile-First, nút to, dễ bấm).
- [ ] Viết hàm client lấy tọa độ GPS: `navigator.geolocation.getCurrentPosition`.
- [ ] Viết API Route `/api/checkin`:
  - Logic tính khoảng cách Haversine.
  - Logic kiểm tra mã PIN cuộc họp.
  - Logic kiểm tra chống bấm hộ bằng `deviceId` (chỉ khóa khi Insert DB thành công).

### GIAI ĐOẠN 3: Trang Quản trị & Màn hình chiếu Realtime (Ngày 5 - 6)
- [ ] Xây dựng trang `/admin`: Tạo sự kiện, lấy tọa độ qua Google Maps/bấm trực tiếp.
- [ ] Chức năng Import danh sách cán bộ từ file Excel/CSV.
- [ ] Xây dựng trang `/live/[id]` dành cho máy chiếu:
  - Tích hợp **Supabase Realtime**: Khi có bản ghi mới ở `checkin_logs`, màn hình tự động "Ting" và nhảy tên người vừa đến mà không cần F5.

### GIAI ĐOẠN 4: Xử lý Ngoại lệ, Bảo mật & Tối ưu UX (Ngày 7 - 8)
- [ ] Xử lý ngoại lệ: Báo lỗi thân thiện khi người dùng lỡ bấm "Chặn quyền vị trí".
- [ ] Thêm nút dự phòng cho Thư ký: "Điểm danh hộ bằng tay" và "Mở khóa thiết bị".
- [ ] Tối ưu bán kính geofence: Mặc định $80\text{m} - 100\text{m}$ để chống trôi GPS trong phòng kín.

### GIAI ĐOẠN 5: Triển khai lên Cloud & Thử nghiệm thực tế (Ngày 9 - 10)
- [ ] Đẩy code lên GitHub.
- [ ] Kết nối GitHub với **Vercel** để tự động build và cấp domain HTTPS.
- [ ] Thử nghiệm thực tế với 5–10 thiết bị khác nhau (iPhone, Android, máy cũ).
- [ ] Bàn giao và viết tài liệu hướng dẫn sử dụng 1 trang.

---

## 🚀 5. QUY TRÌNH CHUẨN ĐỂ XÂY DỰNG MỘT ỨNG DỤNG WEB (BEST PRACTICES)

Để biến một ý tưởng thành sản phẩm web thực tế hoạt động trơn tru, bạn cần tuân theo 6 bước quy trình công nghệ chuẩn sau:

```text
[1. Khảo sát & Đặc tả] ──> [2. Thiết kế Prototype] ──> [3. Thiết lập Hạ tầng]
                                                              │
[6. Vận hành & Tối ưu] <── [5. Đưa lên Cloud (Deploy)] <── [4. Lập trình & Test]