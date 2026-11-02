# Threads Web Clone 🧵

Dự án mô phỏng hoàn chỉnh mạng xã hội Threads (Meta) với trải nghiệm người dùng mượt mà, hỗ trợ đầy đủ các tính năng xác thực, bảng tin, đăng bài kèm ảnh và GIPHY GIF, tương tác đa cấp, trang hoạt động và quản lý trang cá nhân.

---

## 🚀 Tính năng nổi bật

- **Xác thực người dùng (Authentication):**
  - Đăng ký, đăng nhập tài khoản.
  - Tự động lưu phiên đăng nhập và làm mới token ngầm (Refresh Token Interceptor).
  - Quên mật khẩu, đặt lại mật khẩu và xác thực email.
- **Bảng tin (Feed):**
  - Tab *Dành cho bạn* (For You), *Đang theo dõi* (Following), *Chế độ ẩn danh* (Ghost mode).
  - Tải trang mượt mà với phân trang vô tận (Infinite Scroll).
- **Soạn thảo & Đăng bài viết (Create Post):**
  - Đăng bài viết dạng văn bản, hỗ trợ bài viết ẩn danh (Ghost post).
  - **Tải ảnh trực tiếp từ thiết bị:** Xem trước tức thì (preview) và tải lên máy chủ qua `multipart/form-data`.
  - **Tích hợp GIPHY GIF:** Tìm kiếm GIF động theo từ khóa, duyệt theo chủ đề thịnh hành hoặc dán link trực tiếp.
- **Tương tác toàn diện (Interactions):**
  - Thả tim (Like), Đăng lại (Repost), Trích dẫn (Quote kèm ảnh/GIF).
  - Trả lời (Reply) bình luận nhiều cấp.
  - Sao chép liên kết bài viết và xuất bài viết dưới dạng thẻ ảnh.
- **Trang hoạt động (Activity Page):**
  - Bộ lọc thông minh: Tất cả, Theo dõi, Câu trả lời, Lượt thích, Đăng lại, Trích dẫn, Đã xác minh.
  - Nút *Theo dõi lại* / *Đang theo dõi* tương tác tức thì.
- **Trang cá nhân (Profile Page):**
  - Chỉnh sửa hồ sơ: Tên hiển thị, tiểu sử, chế độ tài khoản riêng tư.
  - **Upload ảnh đại diện (Avatar):** Tải ảnh trực tiếp và cập nhật ngay lập tức.
  - Quản lý bài viết của tôi: Chỉnh sửa nội dung và xóa bài viết.
  - Xem trang cá nhân người dùng khác qua định dạng `/@username`.
- **Tìm kiếm (Search):**
  - Tìm kiếm người dùng và bài viết với cơ chế Debounce tối ưu hiệu năng.
- **Tùy biến giao diện (UI/UX):**
  - Chuyển đổi giao diện Sáng / Tối (Light & Dark theme).
  - Hỗ trợ đa ngôn ngữ (Tiếng Việt & Tiếng Anh).

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** React 19, Vite 8, React Router v8
- **State Management & Data Fetching:** Redux Toolkit, TanStack Query (React Query v5)
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Form & Validation:** React Hook Form, Zod
- **API Client:** Axios (Custom Interceptors cho Token Refresh và Multipart Boundary)
- **Deployment:** Vercel

---

## 💻 Cài đặt và chạy dự án cục bộ

1. **Clone repository:**
   ```bash
   git clone https://github.com/NhatThanh101105/ThreadsClone.git
   cd ThreadsClone
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env` với nội dung:
   ```env
   VITE_API_BASE_URL=https://threads.f8team.dev
   ```

4. **Khởi chạy môi trường phát triển:**
   ```bash
   npm run dev
   ```

5. **Build dự án cho Production:**
   ```bash
   npm run build
   ```

---

## 🌐 Triển khai lên Vercel (Deployment)

Dự án đã được cấu hình sẵn file `vercel.json` phục vụ client-side routing cho Single Page Application (SPA).

1. Kết nối repository `NhatThanh101105/ThreadsClone` trên dashboard của [Vercel](https://vercel.com).
2. Thêm biến môi trường:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://threads.f8team.dev`
3. Nhấn **Deploy**.
