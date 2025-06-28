/**
 * AUTO COMMENT SCRIPT
 * 
 * Script tự động thêm comment cho tất cả controllers
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Định nghĩa comment cho từng file
const fileComments = {
  'quiz.controller.js': {
    header: `/**
 * QUIZ CONTROLLER
 * 
 * Xử lý các chức năng liên quan đến quiz/kiểm tra:
 * - Tạo quiz theo category
 * - Tạo quiz tổng hợp  
 * - Tạo quiz ngẫu nhiên
 * - Nộp bài và tính điểm
 * - Lịch sử quiz của user
 * - Generate câu hỏi đa dạng
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */`,
    methods: {
      'create_category_quiz': 'Tạo quiz từ words đã học trong category',
      'create_comprehensive_quiz': 'Tạo quiz tổng hợp từ tất cả words đã học',
      'create_random_quiz': 'Tạo quiz ngẫu nhiên từ database',
      'get_quiz_by_id': 'Lấy quiz theo ID',
      'submit_quiz': 'Nộp bài quiz và tính điểm',
      'get_user_quiz_history': 'Lịch sử làm quiz của user',
      'generateQuizQuestions': 'Generate câu hỏi đa dạng cho quiz',
      'calculateQuizResults': 'Tính toán kết quả quiz'
    }
  },
  
  'streak.controller.js': {
    header: `/**
 * STREAK CONTROLLER
 * 
 * Xử lý hệ thống streak (chuỗi ngày học liên tục):
 * - Khởi tạo streak cho user
 * - Cập nhật streak khi học từ/làm quiz
 * - Theo dõi lịch sử streak
 * - Thống kê streak
 * - Reset streak
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */`,
    methods: {
      'initialize_streak': 'Khởi tạo streak cho user mới',
      'update_words_learned': 'Cập nhật streak khi học từ mới',
      'update_quiz_completed': 'Cập nhật streak khi hoàn thành quiz',
      'get_current_streak': 'Lấy streak hiện tại của user',
      'get_streak_history': 'Lịch sử streak 7 ngày gần nhất',
      'get_streak_stats': 'Thống kê tổng quan streak',
      'reset_streak': 'Reset streak về 0'
    }
  }
};

// Hàm thêm comment vào đầu file
function addHeaderComment(filePath, headerComment) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Kiểm tra xem đã có comment chưa
    if (content.includes('/**') && content.includes('CONTROLLER')) {
      console.log(`✓ ${path.basename(filePath)} đã có comment`);
      return;
    }
    
    // Tìm dòng đầu tiên (thường là require)
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Tìm vị trí thích hợp để chèn comment
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('const ') || lines[i].trim().startsWith('require')) {
        insertIndex = i;
        break;
      }
    }
    
    // Chèn header comment
    lines.splice(insertIndex, 0, headerComment, '');
    
    // Ghi lại file
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`✅ Đã thêm comment cho ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý ${filePath}:`, error.message);
  }
}

// Hàm chính
function addCommentsToControllers() {
  const controllersDir = path.join(__dirname, 'controllers');
  
  if (!fs.existsSync(controllersDir)) {
    console.error('❌ Thư mục controllers không tồn tại');
    return;
  }
  
  console.log('🚀 Bắt đầu thêm comment cho controllers...\n');
  
  // Lấy danh sách file trong thư mục controllers
  const files = fs.readdirSync(controllersDir);
  
  files.forEach(file => {
    if (file.endsWith('.controller.js')) {
      const filePath = path.join(controllersDir, file);
      
      // Kiểm tra xem có comment định nghĩa cho file này không
      if (fileComments[file]) {
        addHeaderComment(filePath, fileComments[file].header);
      } else {
        // Thêm comment generic
        const genericComment = `/**
 * ${file.replace('.js', '').toUpperCase()}
 * 
 * Controller xử lý các chức năng của ${file.replace('.controller.js', '')}
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */`;
        addHeaderComment(filePath, genericComment);
      }
    }
  });
  
  console.log('\n✅ Hoàn thành việc thêm comment cho tất cả controllers');
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  addCommentsToControllers();
}

module.exports = {
  addCommentsToControllers
};
