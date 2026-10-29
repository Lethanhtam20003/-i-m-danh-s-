// components/Header.js
import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 30px', 
      backgroundColor: '#2F3640', // Màu xám đen
      color: '#D4AC0D'            // Màu vàng hổ phách
    }}>
      
      {/* Phần Logo hoặc Tên trang */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px' }}>điểm danh app</h1>
      </div>

      {/* Phần Menu điều hướng */}
      <nav style={{ display: 'flex', gap: '20px' }}>
        <Link href="/" style={{ color: '#D4AC0D', textDecoration: 'none', fontWeight: 'bold' }}>
          Trang Chủ
        </Link>
        <Link href="/test-qr" style={{ color: '#D4AC0D', textDecoration: 'none', fontWeight: 'bold' }}>
          test-qr
        </Link>
        <Link href="/test-location" style={{ color: '#D4AC0D', textDecoration: 'none', fontWeight: 'bold' }}>
          test-location
        </Link>
      </nav>
      
    </header>
  );
}