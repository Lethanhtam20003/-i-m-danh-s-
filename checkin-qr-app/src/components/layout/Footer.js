// components/Footer.js
export default function Footer() {
  return (
    <footer style={{ 
      padding: '20px', 
      backgroundColor: '#1E2124', // Màu đen than
      color: '#ffffff',           // Chữ trắng
      textAlign: 'center',
      marginTop: 'auto'           // Đẩy footer xuống dưới cùng
    }}>
      <p style={{ margin: '0 0 10px 0' }}>
        Điểm danh app - Bản quyền © 2024. Tất cả các quyền được bảo lưu.
      </p>
      <div style={{ fontSize: '14px', color: '#aaaaaa' }}>
        <span>Email: nguyenvanA@gmail.com</span> | <span>Hotline: 0123.456.789</span>
      </div>
    </footer>
  );
}