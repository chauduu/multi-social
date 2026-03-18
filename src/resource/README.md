🚀 AI Social Media Auto-Poster Frontend
Dự án này là giao diện điều khiển (Dashboard) cho hệ thống tự động hóa nội dung đa kênh, tích hợp AI để tạo văn bản, hình ảnh và video.

📁 Cấu trúc Thư mục (Project Structure)
Plaintext
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Thanh điều hướng (User profile, Logo)
│   │   └── SidebarRight.tsx    # Cột quản lý Social Platforms (FB, IG, TikTok...)
│   ├── chat/
│   │   └── ChatBox.tsx         # Khu vực tương tác với AI Assistant
│   └── editor/
│       ├── ContentEditor.tsx   # Trình soạn thảo văn bản bài viết
│       └── MediaPreview.tsx    # Khu vực quản lý ảnh/video (Grid view)
├── hooks/
│   └── useAIContent.ts         # Hook xử lý gọi Gemini API
├── services/
│   └── socialPlatform.ts       # Service xử lý đăng bài (API kết nối Social)
└── App.tsx                     # Layout tổng thể (Grid 3 cột)
🔐 Cấu hình Biến môi trường (.env)
Tạo tệp .env.local ở thư mục gốc. Lưu ý: Trong thực tế, các Secret Key của Social Media nên được xử lý ở Backend để đảm bảo bảo mật. Tuy nhiên, dưới đây là cấu hình cần thiết để FE giao tiếp:

Bash
# AI Generation API (Gemini 3 Pro)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Social Media Integration (Client IDs / App Keys)
VITE_FACEBOOK_APP_ID=your_fb_app_id
VITE_INSTAGRAM_CLIENT_ID=your_ig_id
VITE_TIKTOK_CLIENT_KEY=your_tiktok_key
VITE_X_API_KEY=your_x_api_key
VITE_THREADS_APP_ID=your_threads_id

# Backend API URL (Nếu có)
VITE_API_BASE_URL=http://localhost:5000/api/v1
🛠️ Triển khai Giao diện (Logic chính)
1. Layout Tổng thể (Tailwind CSS)
Sử dụng CSS Grid để chia không gian đúng theo mô tả:

TypeScript
<div className="flex flex-col h-screen">
  <Navbar /> {/* Top Navigation */}
  <main className="flex flex-1 overflow-hidden">
    <ChatBox className="w-1/4 border-r" />      {/* Bên trái: Chatbox */}
    <div className="w-2/4 flex flex-col p-4">   {/* Giữa: Nội dung & Media */}
       <ContentEditor /> 
       <MediaPreview />
       <button className="btn-publish">SCHEDULE / PUBLISH</button>
    </div>
    <SidebarRight className="w-1/4 border-l" /> {/* Bên phải: Social Bars */}
  </main>
</div>
2. Logic gọi Gemini API
Sử dụng Google Generative AI SDK để xử lý prompt trong Chatbox:

TypeScript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generatePostContent = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};
📝 Hướng dẫn Cài đặt
Clone dự án:

Bash
git clone https://github.com/your-repo/ai-publish-fe.git
Cài đặt Dependencies:

Bash
npm install @google/generative-ai lucide-react @tanstack/react-query
Khởi tạo môi trường:

Copy tệp .env.example thành .env.

Điền các API Keys tương ứng.

Chạy dự án:

Bash
npm run dev