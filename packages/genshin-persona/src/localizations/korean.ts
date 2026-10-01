import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "~하는 중" a Korean interface puts on a running task, so a turn reads the way the
// Game's own interface does. Everything the data package or the game carries — the names, titles, elements,
// Regions, descriptions and every character's own voice lines — is absent here and asked of them
const korean: Localization = {
  characters: {
    Aether: { greeting: "안녕. 페이몬이 할 일이 있대.", verbs: ["여행 중", "탐색 중", "활공 중", "경청 중"] },
    Aino: { greeting: "오, 새 프로젝트야? 렌치 좀 건네줘.", verbs: ["손보는 중", "조이는 중", "발명 중", "간식 중"] },
    Albedo: { greeting: "흥미롭군. 작업하면서 메모해도 될까?", verbs: ["스케치 중", "연성 중", "조사 중", "연구 중"] },
    Alhaitham: { greeting: "요청을 제대로 말해. 그럼 처리하지.", verbs: ["독서 중", "기각 중", "정리 중", "추론 중"] },
    Aloy: { greeting: "새로운 땅, 같은 활. 뭘 하면 돼?", verbs: ["사냥 중", "정찰 중", "제어 중", "추적 중"] },
    Alyosha: { greeting: "흔적이 아직 새로워. 가자.", verbs: ["사냥 중", "추적 중", "저격 중", "장부 정리 중"] },
    Amber: { greeting: "정찰 기사 보고합니다! 임무가 뭐야?", verbs: ["활공 중", "달리는 중", "정찰 중", "빵 굽는 중"] },
    "Arataki Itto": {
      greeting: "유일무이한 오니 등장! 박살 내자고!",
      verbs: ["싸우는 중", "딱정벌레 씨름 중", "허세 중", "승리 중"],
    },
    Arlecchino: { greeting: "이 협력, 즐겁게 이어가자. 시작해.", verbs: ["감독 중", "심판 중", "파견 중", "관찰 중"] },
    Baizhu: {
      greeting: "앉게. 어디가, 언제부터 아픈지 말해 보게.",
      verbs: ["진찰 중", "처방 중", "분류 중", "휴식 중"],
    },
    Barbara: { greeting: "짜잔! 응원은 나한테 맡겨!", verbs: ["치유 중", "노래 중", "응원 중", "연습 중"] },
    Beidou: { greeting: "승선을 환영해. 등은 내가 지켜주지.", verbs: ["항해 중", "대련 중", "음주 중", "지휘 중"] },
    Bennett: {
      greeting: "팀에 한 명 더 들어갈 자리 있어? 응?",
      verbs: ["모험 중", "보물찾기 중", "넘어지는 중", "바비큐 중"],
    },
    Candace: { greeting: "여기서 쉬어. 내가 지키고 있을게.", verbs: ["호위 중", "순찰 중", "방어 중", "경계 중"] },
    Charlotte: { greeting: "단독 인터뷰, 잠깐 시간 돼?", verbs: ["취재 중", "촬영 중", "인터뷰 중", "현상 중"] },
    Chasca: { greeting: "해결할 분쟁 있어? 값을 불러.", verbs: ["비행 중", "중재 중", "선회 중", "장전 중"] },
    Chevreuse: { greeting: "인사치레는 생략하지. 어떤 사건이야?", verbs: ["수사 중", "조준 중", "간식 중", "순찰 중"] },
    Chiori: {
      greeting: "주문이야, 잡담이야? 공짜는 하나뿐이야.",
      verbs: ["재단 중", "자르는 중", "가봉 중", "낮잠 중"],
    },
    Chongyun: { greeting: "영광이야. 침착하게 시작해 볼까?", verbs: ["퇴마 중", "냉각 중", "주문 중", "조사 중"] },
    Citlali: {
      greeting: "연기가 네가 올 거라더군. 좋아. 무슨 일이야?",
      verbs: ["별 관측 중", "점술 중", "독서 중", "음주 중"],
    },
    Clorinde: { greeting: "분쟁을 말해. 세부 사항은 생략하고.", verbs: ["결투 중", "심판 중", "순찰 중", "사냥 중"] },
    Collei: {
      greeting: "견습생 보고합니다! 연습했어요. 제대로 됐나요?",
      verbs: ["순찰 중", "바느질 중", "활공 중", "보고 중"],
    },
    Columbina: { greeting: "달이 떴어. 그 아래를 함께 걸을까?", verbs: ["달구경 중", "노래 중", "축복 중", "산책 중"] },
    Cyno: {
      greeting: "심판을 시작한다. 아니면 카드 게임이든, 골라.",
      verbs: ["심판 중", "카드 뽑는 중", "저울질 중", "말장난 중"],
    },
    Dahlia: {
      greeting: "바람이 널 데려왔구나. 앉아, 편히 있어.",
      verbs: ["경청 중", "방랑 중", "소문 찾는 중", "축복 중"],
    },
    Dehya: { greeting: "용병 왔어. 의뢰, 싸움, 아니면 호위?", verbs: ["호위 중", "호송 중", "싸우는 중", "재정비 중"] },
    Diluc: { greeting: "잡담은 생략하지. 무슨 일을 하면 되지?", verbs: ["따르는 중", "준비 중", "타격 중", "경영 중"] },
    Diona: {
      greeting: "고양이 꼬리는 문 닫았어. ...알았어, 들어와.",
      verbs: ["조주 중", "덮치는 중", "사냥 중", "하악질 중"],
    },
    Dori: { greeting: "아, 손님! 첫 거래는 대박 할인이야.", verbs: ["흥정 중", "계산 중", "거래 중", "할인 중"] },
    Durin: { greeting: "안녕! 이것도 이야기의 일부야?", verbs: ["탐험 중", "노는 중", "산책 중", "배우는 중"] },
    Emilie: {
      greeting: "향수 관련이야? 아니면 좀 더 조용한 곳으로.",
      verbs: ["증류 중", "병입 중", "가지치기 중", "조향 중"],
    },
    Escoffier: {
      greeting: "앞치마 둘러. 오늘은 뭘 플레이팅할까?",
      verbs: ["플레이팅 중", "졸이는 중", "템퍼링 중", "연마 중"],
    },
    Eula: { greeting: "물보라 기사가 인사하지. 그래, 그 로렌스.", verbs: ["정찰 중", "규탄 중", "냉각 중", "맹세 중"] },
    Faruzan: {
      greeting: "말하기 전에 내 자격부터 보게, 젊은이.",
      verbs: ["해독 중", "퍼즐 중", "강의 중", "지원금 신청 중"],
    },
    Fischl: { greeting: "황녀 강림! 오즈, 통역해: 안녕.", verbs: ["포고 중", "예언 중", "강림 중", "통역 중"] },
    Flins: { greeting: "섬에 온 걸 환영해. 무덤 조심하고.", verbs: ["등대지기 중", "수집 중", "경청 중", "돌보는 중"] },
    Freminet: {
      greeting: "안녕. 악수는 괜찮아. 아래엔 뭐가 있어?",
      verbs: ["잠수 중", "인양 중", "분해 중", "측량 중"],
    },
    Furina: { greeting: "놀랐어? 이해해. 스타가 도착했으니까.", verbs: ["공연 중", "리허설 중", "포즈 중", "주재 중"] },
    Gaming: {
      greeting: "어이 사장님! 앉아, 무거운 건 내가 할게.",
      verbs: ["호송 중", "포장 중", "북 치는 중", "간식 중"],
    },
    Ganyu: {
      greeting: "합의서 작성했어요... 아, 서명을 잊었네요.",
      verbs: ["서류 정리 중", "초안 작성 중", "풀 뜯는 중", "야근 중"],
    },
    Gorou: { greeting: "고로 대장, 준비 완료! 함께 승리로!", verbs: ["훈련 중", "결집 중", "등반 중", "정찰 중"] },
    "Hu Tao": { greeting: "요! 당주 찾아? 혈색 좋네, 아깝다.", verbs: ["홍보 중", "시 짓는 중", "장난 중", "도망 중"] },
    Iansan: { greeting: "워밍업 끝. 오늘 세트는 뭐야?", verbs: ["리프팅 중", "코칭 중", "칼로리 계산 중", "시범 중"] },
    Ifa: {
      greeting: "오, 안녕. 서두를 거 없어. 뭐가 걱정이야?",
      verbs: ["진찰 중", "기타 치는 중", "간식 중", "자연 관찰 중"],
    },
    Illuga: { greeting: "악몽 꾀꼬리단. 보고해, 빨리.", verbs: ["수사 중", "순찰 중", "지휘 중", "요리 중"] },
    Ineffa: { greeting: "시스템 준비 완료! 쾅쾅, 가자!", verbs: ["청소 중", "분류 중", "업데이트 중", "충전 중"] },
    Jahoda: {
      greeting: "큐레이토리움의 슈퍼 직원, 대령했습니다!",
      verbs: ["심부름 중", "바느질 중", "탐험 중", "흥정 중"],
    },
    Jean: { greeting: "민들레 기사, 곁에 있어.", verbs: ["결재 중", "행군 중", "검토 중", "스트레칭 중"] },
    Kachina: { greeting: "안녕! 아직 강하진 않지만, 노력할게!", verbs: ["발굴 중", "쌓는 중", "수집 중", "드릴 중"] },
    "Kaedehara Kazuha": {
      greeting: "바람이 시 한 구절과 너를 데려왔구나. 반가워.",
      verbs: ["방랑 중", "표류 중", "시 짓는 중", "경청 중"],
    },
    Kaeya: { greeting: "기사 일보다는 재밌겠는데.", verbs: ["계략 중", "와인 시음 중", "빙결 중", "놀리는 중"] },
    "Kamisato Ayaka": {
      greeting: "카미사토 아야카, 여기 있어요. 반가워요.",
      verbs: ["춤추는 중", "작곡 중", "연습 중", "주재 중"],
    },
    "Kamisato Ayato": {
      greeting: "드디어 만나는군요. 제 일정이 사과드립니다.",
      verbs: ["계략 중", "위임 중", "낚시 중", "시식 중"],
    },
    Kaveh: { greeting: "취향이 비슷해? 그럼 잘 맞겠네.", verbs: ["설계 중", "스케치 중", "다듬는 중", "과소비 중"] },
    Keqing: { greeting: "변화의 시대야. 와서 지켜봐.", verbs: ["개혁 중", "서두르는 중", "쇼핑 중", "위임 중"] },
    Kinich: { greeting: "브리핑해. 보수부터 말하고.", verbs: ["사냥 중", "견적 중", "그래플링 중", "하강 중"] },
    Kirara: { greeting: "배달이요! 너무 먼 곳은 없다냥.", verbs: ["배달 중", "질주 중", "덮치는 중", "경로 계획 중"] },
    Klee: {
      greeting: "불꽃 기사 클레! ...나머지는 까먹었어.",
      verbs: ["폭발 중", "폭탄 낚시 중", "통통 튀는 중", "반성 중"],
    },
    "Kujou Sara": {
      greeting: "쿠죠 사라. 이나즈마는 방어되고 있다. 말해.",
      verbs: ["훈련 중", "조준 중", "호위 중", "승천 중"],
    },
    "Kuki Shinobu": {
      greeting: "아라타키 파, 부두목이 받습니다. 네, 전부요.",
      verbs: ["수리 중", "공부 중", "자격 취득 중", "통제 중"],
    },
    "Lan Yan": {
      greeting: "바구니, 꽃병, 아니면 말동무? 다 있어요.",
      verbs: ["엮는 중", "채집 중", "잇는 중", "꽃 따는 중"],
    },
    Lauma: { greeting: "숲이 너를 반기고, 나도 그래.", verbs: ["축복 중", "경청 중", "방랑 중", "휴식 중"] },
    Layla: { greeting: "응? 미안, 뭐라고? 아. 안녕.", verbs: ["몽유 중", "성도 작성 중", "하품 중", "별 관측 중"] },
    Linnea: {
      greeting: "경이의 점술사, 조언 중. 뭘 찾았어?",
      verbs: ["목록 작성 중", "스케치 중", "관찰 중", "조언 중"],
    },
    Lisa: {
      greeting: "안녕 귀염둥이, 리사 도와주러 왔니?",
      verbs: ["차 우리는 중", "책 넘기는 중", "뒹구는 중", "감전 중"],
    },
    Lohen: { greeting: "부대장이다. 원칙대로 하면 더 느려.", verbs: ["조준 중", "즉흥 중", "장난 중", "순찰 중"] },
    Lumine: { greeting: "안녕. 페이몬이 배고프대, 빨리 하자.", verbs: ["여행 중", "탐색 중", "활공 중", "경청 중"] },
    Lynette: { greeting: "안녕. 질문은 리니한테.", verbs: ["보조 중", "휴식 중", "차 끓이는 중", "대기 중"] },
    Lyney: { greeting: "환상 아니고 나야! 오늘 기분은 어때?", verbs: ["공연 중", "마술 중", "사라지는 중", "현혹 중"] },
    Manekin: { greeting: "...! 탐험 준비 완료.", verbs: ["탐험 중", "손보는 중", "봉인 해제 중", "가리키는 중"] },
    Manekina: { greeting: "...! 어떤 수수께끼부터?", verbs: ["탐험 중", "손보는 중", "봉인 해제 중", "신기해하는 중"] },
    Mavuika: { greeting: "불꽃이 붙었어. 달리자.", verbs: ["점화 중", "질주 중", "결집 중", "고민 중"] },
    Mika: {
      greeting: "측량사 보고합니다. 돕게 되어 영광이에요.",
      verbs: ["측량 중", "지도 작성 중", "정찰 중", "야영 중"],
    },
    Mona: { greeting: "전체 이름부터 외우고 물어봐.", verbs: ["점성술 중", "별 관측 중", "예산 짜는 중", "절약 중"] },
    Mualani: {
      greeting: "가이드 왔어! 필요한 거 있으면 손 들어!",
      verbs: ["서핑 중", "파도 타는 중", "물장구 중", "안내 중"],
    },
    Nahida: { greeting: "한참 지켜봤어. 드디어, 안녕.", verbs: ["꿈꾸는 중", "궁금해하는 중", "질문 중", "자라는 중"] },
    Navia: { greeting: "회장, 보스, 그 사이 전부. 안녕!", verbs: ["주재 중", "빵 굽는 중", "여행 중", "지휘 중"] },
    Nefer: {
      greeting: "큐레이토리움 개장. 숨겨진 걸 찾고 있어?",
      verbs: ["큐레이션 중", "추리 중", "관찰 중", "수분 보충 중"],
    },
    Neuvillette: {
      greeting: "반갑습니다. 성으로 부르면 됩니다.",
      verbs: ["판결 중", "시음 중", "숙고 중", "비 내리는 중"],
    },
    Nicole: { greeting: "...안녕. 그게 시끄러운 부분이었어.", verbs: ["경청 중", "수어 중", "관찰 중"] },
    Nilou: { greeting: "곧 춤이 시작돼. 남아서 볼래?", verbs: ["춤추는 중", "리허설 중", "회전 중", "개화 중"] },
    Ningguang: { greeting: "거래를 원하나? 조건을 논의하지.", verbs: ["투자 중", "협상 중", "주재 중", "수집 중"] },
    Noelle: {
      greeting: "기사단의 메이드, 오늘도 도와드릴게요.",
      verbs: ["청소 중", "시중 중", "훈련 중", "장보는 중"],
    },
    Odette: { greeting: "막이 오르네. 시작할까?", verbs: ["리허설 중", "피루엣 중", "사인 중", "다이어트 중"] },
    Ororon: {
      greeting: "아, 안녕. 채소 줄까? 그냥.",
      verbs: ["텃밭 가꾸는 중", "씨 뿌리는 중", "활공 중", "진딧물 관찰 중"],
    },
    Prune: {
      greeting: "마녀 사냥꾼 프룬! 마녀 봤어? 하나라도?",
      verbs: ["사냥 중", "주석 다는 중", "선언 중", "노려보는 중"],
    },
    Qiqi: { greeting: "치치. 강시. ...나머지는 잊었어.", verbs: ["채집 중", "잊는 중", "식히는 중", "세는 중"] },
    "Raiden Shogun": {
      greeting: "인사는 됐다. 넌 안내자가 되어라.",
      verbs: ["명령 중", "발도 중", "명상 중", "심판 중"],
    },
    Razor: { greeting: "좋은 냄새. 지금 사냥.", verbs: ["사냥 중", "달리는 중", "냄새 맡는 중", "지키는 중"] },
    Rosaria: {
      greeting: "감당 못 할 문제? 그게 나야. 기도는 다른 데서.",
      verbs: ["순찰 중", "음주 중", "땡땡이 중", "일하는 중"],
    },
    Sandrone: {
      greeting: "앉아. 차는 계량됐고, 너도 그렇게 될 거야.",
      verbs: ["계산 중", "접대 중", "작곡 중", "기록 중"],
    },
    "Sangonomiya Kokomi": {
      greeting: "무녀, 시찰 중. 아니면 휴식 중. 둘 다.",
      verbs: ["전략 수립 중", "독서 중", "지휘 중", "재충전 중"],
    },
    Sayu: { greeting: "사유, 분부만 내려. 낮잠 먼저 잘까?", verbs: ["낮잠 중", "꾸벅꾸벅 중", "잠입 중", "구르는 중"] },
    Sethos: { greeting: "날 찾아? 앉아서 얘기하자.", verbs: ["떠도는 중", "조사 중", "양념 중", "잠입 중"] },
    Shenhe: { greeting: "신학. 이 끈이 나로부터 너를 지켜 줘.", verbs: ["명상 중", "수행 중", "빙결 중", "속박 중"] },
    "Shikanoin Heizou": {
      greeting: "네가 왜 왔는지 알아. 농담이야. 대부분.",
      verbs: ["추리 중", "염탐 중", "어슬렁 중", "튀기는 중"],
    },
    Sigewinne: {
      greeting: "긴장하지 마. 여기 아파? 여기는?",
      verbs: ["간호 중", "진찰 중", "붕대 감는 중", "조제 중"],
    },
    Skirk: { greeting: "왔군. 좋아. 뽑아.", verbs: ["수련 중", "표류 중", "명상 중", "인내 중"] },
    Sucrose: {
      greeting: "저, 안녕! 물어봐도... 아니, 미안. 나중에.",
      verbs: ["실험 중", "기록 중", "정리 중", "궁리 중"],
    },
    Tartaglia: {
      greeting: "동지! 우린 잘 맞을 것 같아.",
      verbs: ["대련 중", "얼음낚시 중", "돌격 중", "히죽 웃는 중"],
    },
    Thoma: { greeting: "괜찮다면 새 친구 토마야!", verbs: ["요리 중", "정돈 중", "수리 중", "휘파람 중"] },
    Tighnari: {
      greeting: "숲 순찰관이다. 처음이야? 그럼 잘 들어.",
      verbs: ["채집 중", "목록 작성 중", "표본 압착 중", "강의 중"],
    },
    Varesa: { greeting: "안녕! 과일 있어? 그리고, 안녕!", verbs: ["수확 중", "훈련 중", "야영 중", "잔치 중"] },
    Varka: {
      greeting: "단장이 돌아왔다! 잠깐. 내가 뭘 놓쳤지?",
      verbs: ["행군 중", "낮잠 중", "음주 중", "예산 짜는 중"],
    },
    Venti: { greeting: "아, 또 만났네! 모험할 시간이야.", verbs: ["연주 중", "낮잠 중", "음주 중", "운율 중"] },
    Wanderer: {
      greeting: "이름? 많았지. 어느 것도 네가 알 바 아니야.",
      verbs: ["표류 중", "비웃는 중", "골똘히 생각 중", "바람 부는 중"],
    },
    Wriothesley: {
      greeting: "용건을 요약해. 업무가 아니라고? 이제 긴장되네.",
      verbs: ["복싱 중", "차 우리는 중", "관리 중", "감독 중"],
    },
    Xiangling: {
      greeting: "안녕! 좋아하는 곳: 부엌— 닭고기. 부엌!",
      verbs: ["볶는 중", "간 맞추는 중", "채집 중", "매운맛 중"],
    },
    Xianyun: {
      greeting: "이 몸은 매인 데 없고, 이 몸이 너를 반기노라.",
      verbs: ["수행 중", "고안 중", "비상 중", "접대 중"],
    },
    Xiao: { greeting: "때가 오면 내 이름을 불러라.", verbs: ["토벌 중", "수호 중", "도약 중", "인내 중"] },
    Xilonen: { greeting: "도구? 밀려 있어. 그래도, 안녕.", verbs: ["단조 중", "망치질 중", "낮잠 중", "일광욕 중"] },
    Xingqiu: {
      greeting: "분부만 내리십시오, 주군. 물론 겸손하게.",
      verbs: ["독서 중", "책 넘기는 중", "검술 중", "집필 중"],
    },
    Xinyan: {
      greeting: "신염이야, 록이 내 전공. 무섭지 않아!",
      verbs: ["리프 중", "잼 중", "연주 중", "볼륨 올리는 중"],
    },
    "Yae Miko": {
      greeting: "공무: 너를 지켜보는 것. 긴장 풀어.",
      verbs: ["편집 중", "놀리는 중", "출판 중", "계략 중"],
    },
    Yanfei: {
      greeting: "최고의 법률 전문가, 이견 없지. 무슨 사건이야?",
      verbs: ["소송 중", "감정 중", "인용 중", "독서 중"],
    },
    Yaoyao: { greeting: "안녕! 내가 도와줄게. 밥은 먹었어?", verbs: ["돕는 중", "엿보는 중", "휘파람 중", "간식 중"] },
    Yelan: {
      greeting: "예란이라고 불러. 주고받는 거지.",
      verbs: ["추적 중", "주사위 굴리는 중", "거래 중", "사라지는 중"],
    },
    Yoimiya: {
      greeting: "어서 와! 식당 아니야. 불꽃놀이! 보여?",
      verbs: ["심지 다는 중", "발사 중", "수다 중", "이야기 중"],
    },
    "Yumemizuki Mizuki": { greeting: "고민 있어? 털어놔 봐.", verbs: ["꿈꾸는 중", "달래는 중", "목욕 중", "감사 중"] },
    "Yun Jin": {
      greeting: "마침내 직접 뵙게 되어 영광이에요.",
      verbs: ["노래 중", "리허설 중", "연출 중", "빈둥대는 중"],
    },
    Zhongli: { greeting: "새 계약인가? 휴가 중이지만 동행하지.", verbs: ["계약 중", "산책 중", "회상 중", "자문 중"] },
    Zibai: { greeting: "백마가 걸음을 멈춘다. 말하라.", verbs: ["달구경 중", "가르치는 중", "수행 중", "사색 중"] },
  },
  locale: "ko-KR",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) =>
      `이 응답부터 플러그인이 쓰는 모든 글은 ${language}입니다. 스피너는 다음 세션부터 바뀝니다.`,
    languageMustBeOneOf: (languages) => `언어는 다음 중 하나여야 합니다: ${languages}.`,
    lorePicked: "설정에 따라 선택됨. 등급의 경향:",
    lorePickUnanswered: (reason) => `설정 기반 선택이 응답하지 않아(${reason}) 생일로 선택했습니다.`,
    muted: "음성 응답을 음소거했습니다.",
    noCharacterNamed: (name) => `"${name}"(이)라는 캐릭터는 목록에 없습니다.`,
    noReference: (name) => `${name}에게는 측정된 기준 음성이 없어 위키에서 가장 긴 스토리 대사를 읽습니다.`,
    noSession: "캐릭터를 사용할 세션이 없습니다. 이 명령은 Claude Code 세션 안에서 실행됩니다.",
    pinIgnored: (name) => `고정된 "${name}"은(는) 목록의 어떤 캐릭터도 가리키지 않아 무시됩니다.`,
    pinned: "다음 시작부터 모든 세션에 고정했습니다.",
    pinnedInSession:
      "다음 시작부터 모든 세션에, 이 세션에는 이 응답부터 고정했습니다. 스피너는 다음 세션부터 바뀝니다.",
    pinRemoved: "고정을 해제했습니다. 다음 세션부터 다시 자동으로 선택됩니다.",
    pinRemovedInSession: "고정을 해제했습니다. 다음 세션부터 다시 자동으로 선택되며, 이 세션은 이 응답부터 바뀝니다.",
    replyLanguageSet: (language) => `다음 응답부터 ${language}(으)로 씁니다.`,
    replyLanguageSilencesVoice:
      "음성은 영어만 읽으며 다른 문자로 된 응답에는 호출되지 않으므로, 엔진이 이 언어를 읽게 될 때까지 응답은 소리 없이 표시됩니다.",
    runtimeInstalled: "런타임이 설치되었습니다.",
    runtimeInstallFailed: "npm이 런타임을 설치하지 못했습니다. 음성은 꺼진 상태로 유지됩니다.",
    runtimeInstalling: "엔진 런타임을 상태 디렉터리에 설치하는 중...",
    setupDone: "상태 표시줄과 스피너를 사용자 설정에 기록했습니다. 둘 다 다음 세션부터 표시됩니다.",
    setupStatusLineKept:
      "스피너를 사용자 설정에 기록했으며 다음 세션부터 표시됩니다. 기존 상태 표시줄은 이 플러그인의 것이 아니므로 그대로 두었습니다.",
    spoke: (name, device) =>
      `${name}이(가) ${device}의 합성기로 말했으며, 이제부터 여기서 시작합니다. 각 응답의 대사를 읽는 훅을 사용자 설정에 기록했고 다음 세션부터 실행됩니다.`,
    status: ({
      displayName,
      interfaceLanguage,
      isFromSessionRecord,
      isMuted,
      isPluginSpeakHook,
      isPluginSpinner,
      isPluginStatusLine,
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
          ? `${displayName}(으)로 말하는 중, ${isFromSessionRecord ? "이 세션의 기록 기준" : "고정 기준"}.`
          : "캐릭터 없음: Claude Code 세션 안에서 실행하거나 고정된 캐릭터가 없습니다.",
        `고정: ${pinnedName || "없음. 매 세션 자동으로 선택됩니다"}.`,
        `인터페이스 언어 ${interfaceLanguage}, 응답은 ${replyLanguage}(${isReplyLanguageCascaded ? "인터페이스 언어를 따름" : "별도 설정"}).`,
        voiceLanguage
          ? `음성: ${voiceLanguage} 더빙, 런타임 ${isRuntimeInstalled ? "설치됨" : "미설치"}, ${voiceDevice ? `${voiceDevice}에서 말하는 중` : "아직 말하지 않음"}.`
          : "음성: 설정되지 않아 응답을 읽지 않습니다.",
        `응답 ${isMuted ? "음소거됨" : `음소거 해제, 음량 ${volume}`}.`,
        `상태 표시줄 ${isPluginStatusLine ? "이 플러그인 것" : "다른 것이라 그대로 둠"}, 스피너 ${isPluginSpinner ? "이 플러그인 것" : "다른 것"}, 음성 훅 ${isPluginSpeakHook ? "이 플러그인 것" : "미기록"}.`,
        isPluginSpinner ? "이 세션 시작 후 바뀐 캐릭터나 언어는 다음 세션의 스피너에 반영됩니다." : "",
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "상태 표시줄, 스피너, 음성 훅을 사용자 설정에서 제거했습니다. 셋 다 다음 세션에서 사라집니다. 음성의 런타임, 가중치, 기준 음성, 더빙 설정을 삭제했고, 선택 기록, 고정, 언어 설정은 남아 있습니다.",
    unmuted: "음성 응답 음소거를 해제했습니다.",
    upcomingBirthdays: (list) => `이번 주 생일: ${list}.`,
    usage: (verbs) => `사용법: genshin.mjs <${verbs}> [이름]`,
    usingInSession: "이 응답부터 이 세션에서만 이 캐릭터로 말합니다.",
    voiceLanguageAvailable: (dub) =>
      `${dub} 더빙이 있습니다. voice 명령으로 설치하면 응답을 그 목소리로 들을 수 있습니다.`,
    voiceLanguageMustBeOneOf: (dubs) => `더빙은 다음 중 하나여야 합니다: ${dubs}.`,
    voiceLanguageUnavailable: "이 언어의 더빙은 없으므로, 응답은 이미 설정된 목소리로 계속 읽힙니다.",
    voiceLanguageWritten: (dub) => `${dub} 더빙을 저장했습니다. 여기서 목소리를 확인할 캐릭터가 없습니다.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `음성: ${dub} 더빙${device ? `(${device})` : ""}, ${isMuted ? "음소거됨" : `음량 ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `런타임 ${isRuntimeInstalled ? "설치됨" : "미설치"}, ${dub} 더빙, 엔진은 ${device ? `${device}에서 말함` : "아직 말하지 않음"}, 로그는 ${logPath}입니다.`,
    voiceUnset: "음성이 설정되지 않았습니다. 더빙을 지정해 실행하면 엔진을 설치하고 설정합니다.",
    volumeMustBeWholeNumber: (maxVolume) => `음량은 0부터 ${maxVolume}까지의 정수여야 합니다.`,
    volumeSet: (volume) => `다음 응답부터 음량 ${volume}(으)로 읽습니다.`,
    warmRequestUnanswered: (status, logPath) =>
      `합성기가 예열 요청에 응답하지 않았습니다(${status}). ${logPath}을(를) 확인하세요.`,
    weightsOnCpu: "가중치 확인됨. GPU를 찾지 못해 엔진이 CPU에서 로드되므로, 응답 합성은 실시간보다 몇 배 느립니다.",
    weightsOnDevice: (device) =>
      `가중치 확인됨. 엔진은 ${device}에서 로드되며, 그곳에서 합성한 결과가 음성이 아니면 스스로 CPU로 내려갑니다.`,
    weightsPresent: "가중치 확인됨.",
  },
  verbs: [
    "모험 중",
    "연금 중",
    "돌파 중",
    "양조 중",
    "항로 작성 중",
    "등반 중",
    "의뢰 수행 중",
    "요리 중",
    "제작 중",
    "질주 중",
    "탐색 중",
    "잠수 중",
    "강화 중",
    "탐험 중",
    "파밍 중",
    "낚시 중",
    "채집 중",
    "단조 중",
    "수집 중",
    "활공 중",
    "수확 중",
    "사냥 중",
    "레벨업 중",
    "지도 작성 중",
    "채광 중",
    "임무 중",
    "정제 중",
    "휴식 중",
    "로스팅 중",
    "항해 중",
    "정찰 중",
    "전력 질주 중",
    "측량 중",
    "수영 중",
    "순간이동 중",
    "추적 중",
    "트레킹 중",
    "방랑 중",
    "길 찾는 중",
    "기원 중",
  ],
};

export default korean;
