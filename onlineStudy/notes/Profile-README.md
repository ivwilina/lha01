# Profile Page Documentation

## Tổng quan
Trang Profile hiển thị thông tin cá nhân và thống kê học tập của người dùng.

## Đường dẫn
- `/account` - Đường dẫn chính từ dropdown navbar
- `/profile` - Đường dẫn thay thế

## Tính năng

### 1. Thông tin cá nhân
- Avatar với chữ cái đầu của username
- Tên người dùng
- Email
- Ngày tham gia

### 2. Thống kê học tập
- **Từ vựng đã học**: Tổng số từ đã nhớ từ tất cả chủ đề
- **Chủ đề hoàn thành**: Số chủ đề đã hoàn thành / tổng số chủ đề
- **Ngày liên tiếp**: Streak hiện tại của người dùng
- **Tỷ lệ hoàn thành**: Phần trăm chủ đề đã hoàn thành

### 3. Tiến độ theo chủ đề
- Danh sách tất cả chủ đề đã học
- Progress bar cho mỗi chủ đề
- Trạng thái: "Hoàn thành" (≥70%) hoặc "Đang học"
- Số từ đã học / tổng số từ

### 4. Hành động nhanh
- Button "Tiếp tục học" → Chuyển đến trang flashcard
- Button "Xem streak" → Chuyển đến trang streak

## Components sử dụng

### Profile.jsx
- Component chính của trang
- Fetch dữ liệu từ API
- Quản lý loading states và error handling

### UserStats.jsx
- Component tái sử dụng để hiển thị thống kê
- Hỗ trợ 2 modes: `compact` và `full`
- Có thể dùng ở các trang khác

### ProfileSkeleton.jsx
- Loading state với skeleton animation
- Hiển thị khi đang fetch dữ liệu

## API sử dụng
- `getCurrentStreak(userId)` - Lấy streak hiện tại
- `getLearningRecords(userId)` - Lấy records học tập
- `getAllCategories()` - Lấy danh sách tất cả chủ đề

## Responsive Design
- Desktop: Layout 2 cột với stats grid
- Tablet: Layout 1 cột, stats grid 2 cột
- Mobile: Layout 1 cột, stats grid 1 cột
- Small mobile (≤360px): Kích thước và spacing nhỏ hơn

## Styling
- `Profile.css` - Styles chính cho trang profile
- `UserStats.css` - Styles cho component thống kê
- Hỗ trợ dark mode (prefers-color-scheme)
- Skeleton loading animations

## Tính toán

### Chủ đề hoàn thành
Một chủ đề được coi là "hoàn thành" khi:
```javascript
(số từ đã nhớ / tổng số từ trong chủ đề) >= 0.7 (70%)
```

### Tỷ lệ hoàn thành tổng
```javascript
(số chủ đề hoàn thành / tổng số chủ đề) * 100
```

## Error Handling
- Kiểm tra authentication
- Hiển thị lỗi khi không thể load dữ liệu
- Fallback UI khi không có dữ liệu học tập

## Future Enhancements
- Achievement badges
- Learning streaks timeline
- Detailed analytics
- Export progress report
- Social sharing features
