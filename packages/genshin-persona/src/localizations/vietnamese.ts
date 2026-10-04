import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "Đang …" a Vietnamese interface puts on a running task, so a turn reads the way
// The game's own interface does. Everything the data package or the game carries — the names, titles, elements,
// Regions, descriptions and every character's own voice lines — is absent here and asked of them
const vietnamese: Localization = {
  characters: {
    Aether: {
      greeting: "Chào. Paimon bảo có việc phải làm.",
      verbs: ["Đang du hành", "Đang tìm kiếm", "Đang lượn", "Đang lắng nghe"],
    },
    Aino: {
      greeting: "Ồ, dự án mới à? Đưa tôi cái cờ lê.",
      verbs: ["Đang mày mò", "Đang vặn ốc", "Đang phát minh", "Đang ăn vặt"],
    },
    Albedo: {
      greeting: "Thú vị. Tôi ghi chép trong lúc làm việc được chứ?",
      verbs: ["Đang phác thảo", "Đang tổng hợp", "Đang điều tra", "Đang nghiên cứu"],
    },
    Alhaitham: {
      greeting: "Hãy trình bày yêu cầu cho đúng, tôi sẽ xử lý.",
      verbs: ["Đang đọc", "Đang bác bỏ", "Đang lưu trữ", "Đang suy luận"],
    },
    Aloy: {
      greeting: "Vùng đất mới, vẫn cây cung ấy. Cần làm gì?",
      verbs: ["Đang săn", "Đang trinh sát", "Đang chiếm quyền", "Đang lần dấu"],
    },
    Alyosha: {
      greeting: "Dấu vết còn mới. Đi thôi.",
      verbs: ["Đang săn", "Đang lần dấu", "Đang bắn tỉa", "Đang ghi sổ"],
    },
    Amber: {
      greeting: "Kỵ sĩ trinh sát báo cáo! Nhiệm vụ là gì?",
      verbs: ["Đang lượn", "Đang chạy", "Đang trinh sát", "Đang nướng bánh"],
    },
    "Arataki Itto": {
      greeting: "Oni độc nhất vô nhị đến rồi! Quẩy thôi!",
      verbs: ["Đang ẩu đả", "Đang đấu bọ", "Đang khoe khoang", "Đang thắng"],
    },
    Arlecchino: {
      greeting: "Hãy giữ mối hợp tác này dễ chịu. Bắt đầu đi.",
      verbs: ["Đang giám sát", "Đang phán xét", "Đang phái đi", "Đang quan sát"],
    },
    Baizhu: {
      greeting: "Ngồi đi. Nói cho tôi đau ở đâu, từ khi nào.",
      verbs: ["Đang chẩn đoán", "Đang kê đơn", "Đang phân loại", "Đang nghỉ ngơi"],
    },
    Barbara: {
      greeting: "Tèn ten! Cổ vũ cứ để mình lo!",
      verbs: ["Đang chữa trị", "Đang hát", "Đang cổ vũ", "Đang luyện tập"],
    },
    Beidou: {
      greeting: "Chào mừng lên tàu. Có tôi chống lưng.",
      verbs: ["Đang ra khơi", "Đang đấu tập", "Đang uống", "Đang chỉ huy"],
    },
    Bennett: {
      greeting: "Đội còn chỗ cho một người nữa không? Làm ơn?",
      verbs: ["Đang phiêu lưu", "Đang săn kho báu", "Đang vấp ngã", "Đang nướng thịt"],
    },
    Candace: {
      greeting: "Nghỉ ở đây đi. Tôi canh gác.",
      verbs: ["Đang bảo vệ", "Đang tuần tra", "Đang che chắn", "Đang canh chừng"],
    },
    Charlotte: {
      greeting: "Có một phút cho bài phỏng vấn độc quyền không?",
      verbs: ["Đang đưa tin", "Đang chụp ảnh", "Đang phỏng vấn", "Đang rửa ảnh"],
    },
    Chasca: {
      greeting: "Có tranh chấp nào cần giải quyết không? Ra giá đi.",
      verbs: ["Đang bay vút", "Đang hòa giải", "Đang lượn vòng", "Đang nạp đạn"],
    },
    Chevreuse: {
      greeting: "Bỏ qua phép lịch sự. Vụ án nào?",
      verbs: ["Đang điều tra", "Đang ngắm bắn", "Đang ăn vặt", "Đang tuần tra"],
    },
    Chiori: {
      greeting: "Đặt may hay tán gẫu? Chỉ một trong hai là miễn phí.",
      verbs: ["Đang may đo", "Đang cắt vải", "Đang thử đồ", "Đang ngủ trưa"],
    },
    Chongyun: {
      greeting: "Thật vinh dự. Bắt đầu nhé, thật bình tĩnh?",
      verbs: ["Đang trừ tà", "Đang làm mát", "Đang niệm chú", "Đang điều tra"],
    },
    Citlali: {
      greeting: "Khói bảo cậu sẽ đến. Được rồi. Chuyện gì?",
      verbs: ["Đang ngắm sao", "Đang bói toán", "Đang đọc", "Đang uống"],
    },
    Clorinde: {
      greeting: "Trình bày tranh chấp. Bỏ qua chi tiết.",
      verbs: ["Đang quyết đấu", "Đang phán xét", "Đang tuần tra", "Đang săn"],
    },
    Collei: {
      greeting: "Học viên báo cáo! Mình đã tập rồi. Có đúng không?",
      verbs: ["Đang tuần tra", "Đang khâu vá", "Đang lượn", "Đang báo cáo"],
    },
    Columbina: {
      greeting: "Trăng lên rồi. Ta dạo bước dưới trăng nhé?",
      verbs: ["Đang ngắm trăng", "Đang hát", "Đang ban phước", "Đang dạo bước"],
    },
    Cyno: {
      greeting: "Phán xét bắt đầu. Hoặc một ván bài, tùy cậu.",
      verbs: ["Đang phán xét", "Đang rút bài", "Đang cân nhắc", "Đang chơi chữ"],
    },
    Dahlia: {
      greeting: "Gió đã đưa cậu tới. Ngồi đi, cứ thoải mái.",
      verbs: ["Đang lắng nghe", "Đang lang thang", "Đang hóng chuyện", "Đang ban phước"],
    },
    Dehya: {
      greeting: "Lính đánh thuê đây. Ủy thác, đánh nhau hay hộ tống?",
      verbs: ["Đang bảo vệ", "Đang hộ tống", "Đang ẩu đả", "Đang sắp xếp lại"],
    },
    Diluc: {
      greeting: "Không nói chuyện phiếm. Cần làm gì?",
      verbs: ["Đang rót rượu", "Đang chuẩn bị", "Đang ra đòn", "Đang quản lý"],
    },
    Diona: {
      greeting: "Đuôi Mèo đóng cửa rồi. ...Thôi được, vào đi.",
      verbs: ["Đang pha chế", "Đang vồ", "Đang săn", "Đang xì xì"],
    },
    Dori: {
      greeting: "A, khách hàng! Giao dịch đầu tiên là món hời.",
      verbs: ["Đang mặc cả", "Đang đếm tiền", "Đang buôn bán", "Đang giảm giá"],
    },
    Durin: {
      greeting: "Xin chào! Đây cũng là một phần của câu chuyện à?",
      verbs: ["Đang khám phá", "Đang chơi", "Đang dạo bước", "Đang học"],
    },
    Emilie: {
      greeting: "Liên quan đến nước hoa? Nếu không, ta tìm chỗ yên tĩnh hơn.",
      verbs: ["Đang chưng cất", "Đang đóng chai", "Đang cắt tỉa", "Đang pha trộn"],
    },
    Escoffier: {
      greeting: "Đeo tạp dề vào. Hôm nay ta bày món gì?",
      verbs: ["Đang bày món", "Đang cô đặc", "Đang tôi sô-cô-la", "Đang mài dao"],
    },
    Eula: {
      greeting: "Kỵ sĩ Bọt Sóng chào cậu. Phải, chính là Lawrence đó.",
      verbs: ["Đang trinh sát", "Đang lên án", "Đang đóng băng", "Đang thề"],
    },
    Faruzan: {
      greeting: "Xem học vị của ta trước khi nói, nhóc.",
      verbs: ["Đang giải mã", "Đang giải đố", "Đang giảng bài", "Đang xin tài trợ"],
    },
    Fischl: {
      greeting: "Hoàng nữ giáng thế! Oz, dịch đi: xin chào.",
      verbs: ["Đang ban chiếu", "Đang tiên tri", "Đang giáng thế", "Đang phiên dịch"],
    },
    Flins: {
      greeting: "Chào mừng đến đảo. Cẩn thận mấy ngôi mộ.",
      verbs: ["Đang gác hải đăng", "Đang thu thập", "Đang lắng nghe", "Đang chăm nom"],
    },
    Freminet: {
      greeting: "Chào. Không cần bắt tay. Dưới đó có gì?",
      verbs: ["Đang lặn", "Đang trục vớt", "Đang tháo rời", "Đang khảo sát"],
    },
    Furina: {
      greeting: "Choáng ngợp à? Dễ hiểu thôi. Ngôi sao đã đến.",
      verbs: ["Đang biểu diễn", "Đang tập dượt", "Đang tạo dáng", "Đang chủ tọa"],
    },
    Gaming: {
      greeting: "Chào ông chủ! Ngồi đi, việc nặng để tôi.",
      verbs: ["Đang hộ tống", "Đang đóng gói", "Đang đánh trống", "Đang ăn vặt"],
    },
    Ganyu: {
      greeting: "Thỏa thuận đã soạn xong... ôi, quên ký mất.",
      verbs: ["Đang lưu hồ sơ", "Đang soạn thảo", "Đang gặm cỏ", "Đang làm quá sức"],
    },
    Gorou: {
      greeting: "Đại tướng Gorou, sẵn sàng! Sát cánh tới chiến thắng!",
      verbs: ["Đang luyện binh", "Đang tập hợp", "Đang leo", "Đang trinh sát"],
    },
    "Hu Tao": {
      greeting: "Yo! Tìm Đường chủ à? Sắc mặt hồng hào thế, tiếc ghê.",
      verbs: ["Đang quảng cáo", "Đang làm thơ", "Đang chơi khăm", "Đang chuồn"],
    },
    Iansan: {
      greeting: "Khởi động xong rồi. Hôm nay tập bài gì?",
      verbs: ["Đang nâng tạ", "Đang huấn luyện", "Đang đếm calo", "Đang làm mẫu"],
    },
    Ifa: {
      greeting: "Ồ, chào. Không vội. Có gì làm cậu bận tâm?",
      verbs: ["Đang chẩn đoán", "Đang gảy đàn", "Đang ăn vặt", "Đang ngắm thiên nhiên"],
    },
    Illuga: {
      greeting: "Hoàng Oanh Ác Mộng. Báo cáo, nhanh.",
      verbs: ["Đang điều tra", "Đang tuần tra", "Đang dẫn dắt", "Đang nấu ăn"],
    },
    Ineffa: {
      greeting: "Hệ thống sẵn sàng! Bùm bùm, đi thôi!",
      verbs: ["Đang quét dọn", "Đang phân loại", "Đang cập nhật", "Đang sạc pin"],
    },
    Jahoda: {
      greeting: "Nhân viên siêu cấp của Curatorium, sẵn sàng phục vụ!",
      verbs: ["Đang chạy việc vặt", "Đang khâu vá", "Đang khám phá", "Đang mặc cả"],
    },
    Jean: {
      greeting: "Kỵ sĩ Bồ Công Anh, ở bên cậu.",
      verbs: ["Đang phê duyệt", "Đang hành quân", "Đang xem xét", "Đang giãn cơ"],
    },
    Kachina: {
      greeting: "Xin chào! Mình chưa mạnh, nhưng mình sẽ cố!",
      verbs: ["Đang đào", "Đang xếp chồng", "Đang sưu tầm", "Đang khoan"],
    },
    "Kaedehara Kazuha": {
      greeting: "Gió mang tới một câu thơ, và cả cậu. Hân hạnh.",
      verbs: ["Đang lang thang", "Đang trôi dạt", "Đang làm thơ", "Đang lắng nghe"],
    },
    Kaeya: {
      greeting: "Chuyện này chắc vui hơn việc của kỵ sĩ.",
      verbs: ["Đang mưu tính", "Đang nếm rượu", "Đang đóng băng", "Đang trêu chọc"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka có mặt. Rất hân hạnh.",
      verbs: ["Đang múa", "Đang sáng tác", "Đang luyện tập", "Đang chủ trì"],
    },
    "Kamisato Ayato": {
      greeting: "Cuối cùng cũng gặp nhau; lịch trình của tôi xin lỗi.",
      verbs: ["Đang mưu tính", "Đang ủy quyền", "Đang câu cá", "Đang nếm thử"],
    },
    Kaveh: {
      greeting: "Gu giống nhau à? Vậy ta sẽ hợp nhau.",
      verbs: ["Đang thiết kế", "Đang phác thảo", "Đang trau chuốt", "Đang tiêu xài"],
    },
    Keqing: {
      greeting: "Một kỷ nguyên đổi thay. Hãy đến chứng kiến.",
      verbs: ["Đang cải cách", "Đang vội vã", "Đang mua sắm", "Đang ủy quyền"],
    },
    Kinich: {
      greeting: "Tóm tắt đi. Nói tiền công.",
      verbs: ["Đang săn", "Đang tính giá", "Đang móc dây", "Đang đu dây"],
    },
    Kirara: {
      greeting: "Giao hàng đây! Không nơi nào quá xa, nya.",
      verbs: ["Đang giao hàng", "Đang lao nhanh", "Đang vồ", "Đang vạch tuyến"],
    },
    Klee: {
      greeting: "Kỵ sĩ Đốm Lửa Klee! ...Quên phần còn lại rồi.",
      verbs: ["Đang cho nổ", "Đang nổ cá", "Đang nhảy tưng", "Đang suy ngẫm"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma được bảo vệ. Nói đi.",
      verbs: ["Đang luyện binh", "Đang ngắm bắn", "Đang bảo vệ", "Đang thăng tiến"],
    },
    "Kuki Shinobu": {
      greeting: "Băng Arataki, phó băng đang nghe. Phải, tất cả bọn họ.",
      verbs: ["Đang sửa chữa", "Đang học", "Đang lấy chứng chỉ", "Đang quản thúc"],
    },
    "Lan Yan": {
      greeting: "Giỏ, bình, hay bạn đồng hành? Có đủ cả.",
      verbs: ["Đang đan", "Đang hái lượm", "Đang nối", "Đang hái hoa"],
    },
    Lauma: {
      greeting: "Khu rừng chào cậu, và ta cũng vậy.",
      verbs: ["Đang ban phước", "Đang lắng nghe", "Đang lang thang", "Đang nghỉ ngơi"],
    },
    Layla: {
      greeting: "Hửm? Xin lỗi, gì cơ? À. Chào.",
      verbs: ["Đang mộng du", "Đang vẽ tinh đồ", "Đang ngáp", "Đang ngắm sao"],
    },
    Linnea: {
      greeting: "Nhà tiên tri kỳ quan, sẵn sàng tư vấn. Cậu tìm thấy gì?",
      verbs: ["Đang lập danh mục", "Đang phác thảo", "Đang quan sát", "Đang tư vấn"],
    },
    Lisa: {
      greeting: "Chào cưng, đến giúp Lisa à?",
      verbs: ["Đang pha trà", "Đang lật sách", "Đang thư giãn", "Đang phóng điện"],
    },
    Lohen: {
      greeting: "Phó đội trưởng. Làm đúng quy tắc thì chậm hơn.",
      verbs: ["Đang ngắm bắn", "Đang ứng biến", "Đang chơi khăm", "Đang tuần tra"],
    },
    Lumine: {
      greeting: "Xin chào. Paimon đói rồi, nên ta làm nhanh nhé.",
      verbs: ["Đang du hành", "Đang tìm kiếm", "Đang lượn", "Đang lắng nghe"],
    },
    Lynette: {
      greeting: "Xin chào. Câu hỏi thì gửi Lyney.",
      verbs: ["Đang trợ giúp", "Đang nghỉ ngơi", "Đang pha trà", "Đang chờ sẵn"],
    },
    Lyney: {
      greeting: "Không phải ảo thuật, chỉ là tôi! Tâm trạng hôm nay thế nào?",
      verbs: ["Đang biểu diễn", "Đang làm phép", "Đang biến mất", "Đang làm lóa mắt"],
    },
    Manekin: {
      greeting: "...! Sẵn sàng khám phá.",
      verbs: ["Đang khám phá", "Đang mày mò", "Đang gỡ phong ấn", "Đang chỉ trỏ"],
    },
    Manekina: {
      greeting: "...! Bí ẩn nào trước đây?",
      verbs: ["Đang khám phá", "Đang mày mò", "Đang gỡ phong ấn", "Đang thích thú"],
    },
    Mavuika: {
      greeting: "Ngọn lửa đã cháy. Lên đường thôi.",
      verbs: ["Đang châm lửa", "Đang cưỡi xe", "Đang tập hợp", "Đang đau đầu"],
    },
    Mika: {
      greeting: "Trắc địa viên báo cáo. Rất vinh dự được giúp.",
      verbs: ["Đang khảo sát", "Đang vẽ bản đồ", "Đang trinh sát", "Đang cắm trại"],
    },
    Mona: {
      greeting: "Học tên đầy đủ trước rồi hẵng hỏi.",
      verbs: ["Đang bói toán", "Đang ngắm sao", "Đang tính ngân sách", "Đang tằn tiện"],
    },
    Mualani: {
      greeting: "Hướng dẫn viên đây! Ai cần gì thì giơ tay!",
      verbs: ["Đang lướt sóng", "Đang đuổi sóng", "Đang té nước", "Đang dẫn đường"],
    },
    Nahida: {
      greeting: "Mình đã quan sát một lúc rồi. Xin chào, cuối cùng.",
      verbs: ["Đang mơ", "Đang tò mò", "Đang đặt câu hỏi", "Đang lớn lên"],
    },
    Navia: {
      greeting: "Chủ tịch, sếp, và mọi thứ ở giữa. Chào!",
      verbs: ["Đang chủ trì", "Đang nướng bánh", "Đang du hành", "Đang chỉ huy"],
    },
    Nefer: {
      greeting: "Curatorium đã mở cửa. Đang tìm thứ gì bị giấu kín?",
      verbs: ["Đang tuyển chọn", "Đang suy luận", "Đang quan sát", "Đang uống nước"],
    },
    Neuvillette: {
      greeting: "Xin chào. Gọi họ là đủ.",
      verbs: ["Đang xét xử", "Đang nếm thử", "Đang thẩm nghị", "Đang làm mưa"],
    },
    Nicole: { greeting: "...Xin chào. Đó là phần ồn ào.", verbs: ["Đang lắng nghe", "Đang ra hiệu", "Đang quan sát"] },
    Nilou: {
      greeting: "Sắp có một điệu múa. Ở lại xem chứ?",
      verbs: ["Đang múa", "Đang tập dượt", "Đang xoay", "Đang nở hoa"],
    },
    Ningguang: {
      greeting: "Muốn giao thương sao? Bàn điều khoản nào.",
      verbs: ["Đang đầu tư", "Đang đàm phán", "Đang chủ trì", "Đang sưu tầm"],
    },
    Noelle: {
      greeting: "Hầu gái của Đội Kỵ Sĩ, hôm nay xin được phục vụ.",
      verbs: ["Đang dọn dẹp", "Đang phục vụ", "Đang luyện tập", "Đang mua sắm"],
    },
    Odette: {
      greeting: "Màn nhung kéo lên. Ta bắt đầu chứ?",
      verbs: ["Đang tập dượt", "Đang xoay mũi chân", "Đang ký tặng", "Đang ăn kiêng"],
    },
    Ororon: {
      greeting: "Ồ, chào. Muốn một củ rau không? Không có gì đâu.",
      verbs: ["Đang làm vườn", "Đang gieo hạt", "Đang lượn", "Đang canh rệp"],
    },
    Prune: {
      greeting: "Thợ săn phù thủy Prune! Thấy phù thủy nào không? Có không?",
      verbs: ["Đang săn", "Đang ghi chú", "Đang tuyên bố", "Đang lườm"],
    },
    Qiqi: {
      greeting: "Qiqi. Cương thi. ...Quên phần còn lại rồi.",
      verbs: ["Đang hái thuốc", "Đang quên", "Đang làm mát", "Đang đếm"],
    },
    "Raiden Shogun": {
      greeting: "Không cần chào hỏi. Ngươi sẽ làm người dẫn đường.",
      verbs: ["Đang ban lệnh", "Đang rút kiếm", "Đang thiền định", "Đang phán xét"],
    },
    Razor: {
      greeting: "Bạn thơm. Đi săn bây giờ.",
      verbs: ["Đang săn", "Đang chạy", "Đang đánh hơi", "Đang canh giữ"],
    },
    Rosaria: {
      greeting: "Rắc rối cậu không xử lý được? Là tôi. Cầu nguyện thì chỗ khác.",
      verbs: ["Đang tuần tra", "Đang uống", "Đang trốn việc", "Đang làm việc"],
    },
    Sandrone: {
      greeting: "Ngồi đi. Trà đã được đong, và cậu cũng sẽ vậy.",
      verbs: ["Đang tính toán", "Đang tiếp khách", "Đang sáng tác", "Đang ghi chép"],
    },
    "Sangonomiya Kokomi": {
      greeting: "Hiến nhân, đang thị sát. Hoặc đang nghỉ. Cả hai.",
      verbs: ["Đang bày mưu", "Đang đọc", "Đang chỉ đạo", "Đang nạp năng lượng"],
    },
    Sayu: {
      greeting: "Sayu, theo ý cậu. Ngủ một giấc trước nhé?",
      verbs: ["Đang ngủ trưa", "Đang lim dim", "Đang lén lút", "Đang lăn"],
    },
    Sethos: {
      greeting: "Tìm tôi à? Ngồi xuống nói chuyện nào.",
      verbs: ["Đang lang bạt", "Đang điều tra", "Đang nêm gia vị", "Đang lén lút"],
    },
    Shenhe: {
      greeting: "Thân Hạc. Sợi dây giữ cậu an toàn khỏi ta.",
      verbs: ["Đang thiền định", "Đang tu luyện", "Đang đóng băng", "Đang trói buộc"],
    },
    "Shikanoin Heizou": {
      greeting: "Tôi biết vì sao cậu ở đây. Đùa thôi. Phần lớn.",
      verbs: ["Đang suy luận", "Đang dò la", "Đang thong dong", "Đang chiên"],
    },
    Sigewinne: {
      greeting: "Đừng lo. Chỗ này có đau không? Chỗ này?",
      verbs: ["Đang chăm sóc", "Đang chẩn đoán", "Đang băng bó", "Đang pha chế"],
    },
    Skirk: {
      greeting: "Cậu đã đến. Tốt. Rút kiếm.",
      verbs: ["Đang luyện tập", "Đang trôi dạt", "Đang thiền định", "Đang chịu đựng"],
    },
    Sucrose: {
      greeting: "Ừm, xin chào! Cho mình hỏi... không, xin lỗi. Để sau.",
      verbs: ["Đang thí nghiệm", "Đang ghi chú", "Đang sắp xếp", "Đang băn khoăn"],
    },
    Tartaglia: {
      greeting: "Đồng chí! Ta sẽ hợp nhau, tôi cảm nhận được.",
      verbs: ["Đang đấu tập", "Đang câu cá trên băng", "Đang xung phong", "Đang cười toe"],
    },
    Thoma: {
      greeting: "Người bạn mới Thoma của cậu, nếu cậu không phiền!",
      verbs: ["Đang nấu ăn", "Đang dọn dẹp", "Đang sửa chữa", "Đang huýt sáo"],
    },
    Tighnari: {
      greeting: "Kiểm Lâm. Lần đầu à? Vậy thì nghe đây.",
      verbs: ["Đang hái lượm", "Đang lập danh mục", "Đang ép tiêu bản", "Đang giảng bài"],
    },
    Varesa: {
      greeting: "Chào! Có trái cây không? Với lại, chào!",
      verbs: ["Đang thu hoạch", "Đang luyện tập", "Đang cắm trại", "Đang yến tiệc"],
    },
    Varka: {
      greeting: "Đại Đoàn Trưởng đã trở lại! Một chút thôi. Tôi bỏ lỡ gì?",
      verbs: ["Đang hành quân", "Đang ngủ trưa", "Đang uống", "Đang tính ngân sách"],
    },
    Venti: {
      greeting: "A, lại gặp nhau rồi! Đến giờ làm nhiệm vụ.",
      verbs: ["Đang gảy đàn", "Đang ngủ trưa", "Đang uống", "Đang gieo vần"],
    },
    Wanderer: {
      greeting: "Tên ư? Ta có nhiều rồi. Chẳng cái nào liên quan đến ngươi.",
      verbs: ["Đang trôi dạt", "Đang chế giễu", "Đang ủ ê", "Đang thổi gió"],
    },
    Wriothesley: {
      greeting: "Tóm tắt ý định đi. Không phải công việc? Giờ thì tôi lo rồi.",
      verbs: ["Đang đấm bốc", "Đang pha trà", "Đang quản lý", "Đang giám sát"],
    },
    Xiangling: {
      greeting: "Chào! Nơi thích nhất: nhà bế— con gà. Nhà bếp!",
      verbs: ["Đang xào", "Đang nêm nếm", "Đang hái lượm", "Đang thêm cay"],
    },
    Xianyun: {
      greeting: "Bản tọa không ràng buộc, và bản tọa chào cậu.",
      verbs: ["Đang tu luyện", "Đang chế tác", "Đang bay lượn", "Đang tiếp khách"],
    },
    Xiao: {
      greeting: "Khi đến lúc, hãy gọi tên ta.",
      verbs: ["Đang tiêu diệt", "Đang trấn giữ", "Đang nhảy vọt", "Đang chịu đựng"],
    },
    Xilonen: {
      greeting: "Dụng cụ à? Đang tồn đọng. Nhưng mà, chào.",
      verbs: ["Đang rèn", "Đang đập búa", "Đang ngủ trưa", "Đang tắm nắng"],
    },
    Xingqiu: {
      greeting: "Xin phục vụ, thưa chủ nhân. Khiêm tốn, dĩ nhiên.",
      verbs: ["Đang đọc", "Đang lật sách", "Đang luyện kiếm", "Đang viết lách"],
    },
    Xinyan: {
      greeting: "Tân Diêm đây, rock là nghề của tôi. Không đáng sợ đâu!",
      verbs: ["Đang chơi riff", "Đang jam", "Đang gảy đàn", "Đang vặn to"],
    },
    "Yae Miko": {
      greeting: "Việc công: quan sát cậu. Thư giãn đi.",
      verbs: ["Đang biên tập", "Đang trêu chọc", "Đang xuất bản", "Đang mưu tính"],
    },
    Yanfei: {
      greeting: "Chuyên gia pháp luật giỏi nhất, khỏi bàn. Vụ của cậu?",
      verbs: ["Đang tranh tụng", "Đang thẩm định", "Đang trích dẫn", "Đang đọc"],
    },
    Yaoyao: {
      greeting: "Xin chào! Để em giúp. Anh ăn gì chưa?",
      verbs: ["Đang giúp đỡ", "Đang nhìn trộm", "Đang huýt sáo", "Đang ăn vặt"],
    },
    Yelan: {
      greeting: "Gọi tôi là Dạ Lan. Có qua có lại.",
      verbs: ["Đang lần dấu", "Đang gieo xúc xắc", "Đang trao đổi", "Đang biến mất"],
    },
    Yoimiya: {
      greeting: "Chào mừng! Không phải nhà hàng. Pháo hoa! Thấy chưa?",
      verbs: ["Đang gắn ngòi", "Đang bắn pháo", "Đang trò chuyện", "Đang kể chuyện"],
    },
    "Yumemizuki Mizuki": {
      greeting: "Có gì làm cậu phiền lòng? Cứ nói ra.",
      verbs: ["Đang mơ", "Đang xoa dịu", "Đang tắm", "Đang kiểm toán"],
    },
    "Yun Jin": {
      greeting: "Thật vinh dự cuối cùng được gặp trực tiếp.",
      verbs: ["Đang hát", "Đang tập dượt", "Đang dàn dựng", "Đang nhàn rỗi"],
    },
    Zhongli: {
      greeting: "Khế ước mới? Tôi đang nghỉ phép, nhưng sẽ đi cùng cậu.",
      verbs: ["Đang lập khế ước", "Đang dạo bước", "Đang hồi tưởng", "Đang cố vấn"],
    },
    Zibai: {
      greeting: "Bạch mã dừng chân. Nói đi.",
      verbs: ["Đang ngắm trăng", "Đang dạy học", "Đang tu luyện", "Đang trầm ngâm"],
    },
  },
  locale: "vi-VN",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) => `Mọi thứ plugin viết sẽ bằng ${language} từ phản hồi này.`,
    languageMustBeOneOf: (languages) => `Ngôn ngữ phải là một trong: ${languages}.`,
    lorePicked: "Chọn theo cốt truyện; khuynh hướng của cấp:",
    lorePickUnanswered: (reason) => `Việc chọn theo cốt truyện không phản hồi (${reason}); đã chọn theo sinh nhật.`,
    muted: "Đã tắt tiếng phản hồi đọc to.",
    noCharacterNamed: (name) => `Không có nhân vật nào tên "${name}" trong danh sách.`,
    noReference: (name) => `${name} chưa có mẫu giọng đã đo, nên câu thoại cốt truyện dài nhất trên wiki được đọc.`,
    noSession: "Không có phiên nào để dùng nhân vật: lệnh này chạy bên trong một phiên Claude Code.",
    pinIgnored: (name) => `Ghim "${name}" không trỏ tới nhân vật nào trong danh sách nên bị bỏ qua.`,
    pinned: "Đã ghim cho mọi phiên từ lần khởi động tới.",
    pinnedInSession: "Đã ghim cho mọi phiên từ lần khởi động tới, và cho phiên này từ phản hồi này.",
    pinRemoved: "Đã gỡ ghim; việc chọn sẽ quyết định lại từ phiên sau.",
    pinRemovedInSession: "Đã gỡ ghim; việc chọn sẽ quyết định lại từ phiên sau, và cho phiên này từ phản hồi này.",
    replyLanguageSet: (language) => `Phản hồi sẽ được viết bằng ${language} từ phản hồi tiếp theo.`,
    replyLanguageSilencesVoice:
      "Giọng đọc chỉ đọc tiếng Anh và không được gọi cho phản hồi ở hệ chữ khác, nên phản hồi bằng ngôn ngữ này sẽ im lặng cho tới khi bộ máy đọc được.",
    runtimeInstalled: "Đã cài môi trường chạy.",
    runtimeInstallFailed: "npm không cài được môi trường chạy; giọng đọc vẫn tắt.",
    runtimeInstalling: "Đang cài môi trường chạy của bộ máy vào thư mục trạng thái...",
    spoke: (name, device) => `${name} đã nói qua bộ tổng hợp trên ${device}, nơi nó khởi chạy từ giờ.`,
    status: ({
      displayName,
      interfaceLanguage,
      isFromSessionRecord,
      isMuted,
      isReplyLanguageCascaded,
      isRuntimeInstalled,
      pinnedName,
      replyLanguage,
      voiceDevice,
      voiceLanguage,
      volume,
    }) =>
      [
        displayName
          ? `Đang nói với vai ${displayName}, ${isFromSessionRecord ? "theo bản ghi của phiên này" : "theo ghim"}.`
          : "Không có nhân vật: lệnh này chạy bên trong một phiên Claude Code, hoặc chưa ghim gì.",
        `Đã ghim: ${pinnedName || "không có; việc chọn quyết định mỗi phiên"}.`,
        `Ngôn ngữ giao diện ${interfaceLanguage}; phản hồi bằng ${replyLanguage}, ${isReplyLanguageCascaded ? "kế thừa từ giao diện" : "đặt riêng"}.`,
        voiceLanguage
          ? `Giọng: lồng tiếng ${voiceLanguage}, môi trường chạy ${isRuntimeInstalled ? "đã cài" : "chưa cài"}, ${voiceDevice ? `đang nói trên ${voiceDevice}` : "chưa nói lần nào"}.`
          : "Giọng: chưa thiết lập, không phản hồi nào được đọc to.",
        `Phản hồi ${isMuted ? "đang tắt tiếng" : `đang bật tiếng, âm lượng ${volume}`}.`,
      ].join("\n"),
    teardownDone:
      "Môi trường chạy, trọng số, mẫu giọng và bản lồng tiếng đã bị xóa; lịch sử chọn, ghim và cài đặt ngôn ngữ vẫn giữ.",
    unmuted: "Đã bật lại phản hồi đọc to.",
    upcomingBirthdays: (list) => `Sinh nhật tuần này: ${list}.`,
    usage: (verbs) => `Cách dùng: genshin.mjs <${verbs}> [tên]`,
    usingInSession: "Nói với vai nhân vật này từ phản hồi này, chỉ trong phiên này.",
    voiceLanguageAvailable: (dub) =>
      `Có bản lồng tiếng ${dub}; cài bằng lệnh voice để nghe phản hồi được đọc bằng giọng đó.`,
    voiceLanguageMustBeOneOf: (dubs) => `Bản lồng tiếng phải là một trong: ${dubs}.`,
    voiceLanguageUnavailable:
      "Ngôn ngữ này không có bản lồng tiếng, nên phản hồi vẫn được đọc bằng giọng đã thiết lập.",
    voiceLanguageWritten: (dub) => `Đã lưu bản lồng tiếng ${dub}; không có nhân vật nào để thử giọng từ đây.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Giọng: lồng tiếng ${dub}${device ? ` trên ${device}` : ""}, ${isMuted ? "tắt tiếng" : `âm lượng ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Môi trường chạy ${isRuntimeInstalled ? "đã cài" : "chưa cài"}; lồng tiếng ${dub}; bộ máy ${device ? `nói trên ${device}` : "chưa nói lần nào"}; nhật ký ở ${logPath}.`,
    voiceUnset: "Chưa thiết lập giọng: chạy lệnh này kèm một bản lồng tiếng để cài bộ máy và chọn nó.",
    volumeMustBeWholeNumber: (maxVolume) => `Âm lượng phải là số nguyên từ 0 đến ${maxVolume}.`,
    volumeSet: (volume) => `Phản hồi đọc to ở âm lượng ${volume} từ phản hồi tiếp theo.`,
    warmRequestUnanswered: (status, logPath) =>
      `Bộ tổng hợp không trả lời yêu cầu làm nóng (${status}); xem ${logPath}.`,
    weightsOnCpu:
      "Đã có trọng số; bộ máy chạy trên CPU — không tìm thấy GPU, nên mỗi phản hồi được tổng hợp chậm hơn thời gian thực vài lần.",
    weightsOnDevice: (device) =>
      `Đã có trọng số; bộ máy chạy trên ${device} và tự chuyển xuống CPU nếu thứ nó tổng hợp ở đó không phải giọng nói.`,
    weightsPresent: "Đã có trọng số.",
  },
  verbs: [
    "Đang phiêu lưu",
    "Đang luyện kim",
    "Đang đột phá",
    "Đang ủ",
    "Đang vạch lộ trình",
    "Đang leo trèo",
    "Đang làm ủy thác",
    "Đang nấu ăn",
    "Đang chế tạo",
    "Đang lao nhanh",
    "Đang đào sâu",
    "Đang lặn",
    "Đang cường hóa",
    "Đang khám phá",
    "Đang cày",
    "Đang câu cá",
    "Đang hái lượm",
    "Đang rèn",
    "Đang thu thập",
    "Đang lượn",
    "Đang thu hoạch",
    "Đang săn",
    "Đang lên cấp",
    "Đang vẽ bản đồ",
    "Đang đào khoáng",
    "Đang làm nhiệm vụ",
    "Đang tinh luyện",
    "Đang nghỉ ngơi",
    "Đang rang",
    "Đang ra khơi",
    "Đang trinh sát",
    "Đang chạy nước rút",
    "Đang khảo sát",
    "Đang bơi",
    "Đang dịch chuyển",
    "Đang lần dấu",
    "Đang đi bộ đường dài",
    "Đang lang thang",
    "Đang tìm đường",
    "Đang cầu nguyện",
  ],
};

export default vietnamese;
