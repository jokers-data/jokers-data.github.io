// app.js

// 1. 뷰 스위치 요소
const viewMain = document.getElementById('main-view');
const viewDetail = document.getElementById('detail-view');

// 2. 모달 및 입력 요소
const modal = document.getElementById('post-modal');
const modalHeading = document.getElementById('modal-heading');
const postCategory = document.getElementById('post-category');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const btnNewPost = document.getElementById('btn-new-post');
const btnSave = document.getElementById('btn-save');
const btnClose = document.getElementById('btn-close');

// 3. 메인 & 상세 뷰 요소
const postGrid = document.getElementById('post-grid');
const searchInput = document.getElementById('search-input');
const detailCategory = document.getElementById('detail-category');
const detailTitle = document.getElementById('detail-title');
const detailDate = document.getElementById('detail-date');
const detailBody = document.getElementById('detail-body');
const btnBackMain = document.getElementById('btn-back-main');
const btnDetailEdit = document.getElementById('btn-detail-edit');
const btnDetailDelete = document.getElementById('btn-detail-delete');
const filterBtns = document.querySelectorAll('.tag-btn');
const themeToggle = document.getElementById('theme-toggle');

// 상태 관리
let currentPostIndex = -1; 
let isEditMode = false;
let activeCategory = 'All';

// --- DB (로컬 스토리지) 관리 ---
function getAllPosts() {
    const data = localStorage.getItem('jokers_all_posts');
    return data ? JSON.parse(data) : [];
}

function saveAllPosts(posts) {
    localStorage.setItem('jokers_all_posts', JSON.stringify(posts));
}

// --- 메인 화면 렌더링 (카드 피드 생성) ---
function renderDashboard(searchTerm = "") {
    const posts = getAllPosts();
    const postGrid = document.getElementById('post-grid');
    postGrid.innerHTML = ''; 

    posts.forEach((post, index) => {
        // 검색어 필터
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        // 카테고리 필터
        const matchesCategory = (activeCategory === 'All' || post.category === activeCategory);

        if (matchesSearch && matchesCategory) {
            const summary = post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content;
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div class="post-card-header">
                    <h3>${post.title}</h3>
                    <span class="post-card-date">${post.date}</span>
                </div>
                <p class="post-card-summary">${summary}</p>
            `;
            card.addEventListener('click', () => openDetailView(index));
            postGrid.appendChild(card);
        }
    });
}

// ==========================================
// 1. [네온사인] 마크다운 엔진에 Highlight.js 장착
// ==========================================
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

// ==========================================
// 2. [카멜레온] 주/야간 모드 스위치
// ==========================================
let currentTheme = localStorage.getItem('jokers_theme') || 'dark';
if(currentTheme === 'light') {
    document.body.setAttribute('data-theme', 'light');
    themeToggle.innerText = '🌙';
}

themeToggle.addEventListener('click', () => {
    if (document.body.getAttribute('data-theme') === 'light') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('jokers_theme', 'dark');
        themeToggle.innerText = '☀️';
    } else {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('jokers_theme', 'light');
        themeToggle.innerText = '🌙';
    }
});

// ==========================================
// 3. [네비게이터] 스크롤 진행바
// ==========================================
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progress-bar').style.width = scrolled + '%';
});

// ==========================================
// 4. [네비게이터] 자동 목차(TOC) 생성 함수
// ==========================================
function generateTOC() {
    const tocContainer = document.getElementById('toc-container');
    const tocList = document.getElementById('toc-list');
    tocList.innerHTML = ''; // 초기화

    // 본문 안의 h1, h2, h3 태그를 모두 찾음
    const headers = detailBody.querySelectorAll('h1, h2, h3');
    
    if(headers.length === 0) {
        tocContainer.style.display = 'none'; // 제목이 없으면 목차 숨김
        return;
    }

    tocContainer.style.display = 'block'; // 목차 표시

    headers.forEach((header, index) => {
        header.id = 'heading-' + index; // 스크롤을 위한 고유 ID 부여
        
        const link = document.createElement('a');
        link.href = '#' + header.id;
        link.innerText = header.innerText;
        link.className = header.tagName.toLowerCase(); // h1, h2, h3 클래스 부여 (들여쓰기 용도)
        
        // 클릭 시 스무스하게 스크롤 이동
        link.addEventListener('click', (e) => {
            e.preventDefault();
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        tocList.appendChild(link);
    });
}

// 검색 이벤트
searchInput.addEventListener('input', (e) => renderDashboard(e.target.value));

// --- 새 글 작성 모달 열기 ---
btnNewPost.addEventListener('click', () => {
    isEditMode = false;
    modalHeading.innerText = "새 글 작성";
    postTitle.value = '';
    postContent.value = '';
    modal.style.display = 'flex';
});

// 모달 닫기
btnClose.addEventListener('click', () => modal.style.display = 'none');

// --- 글 저장 로직 ---
btnSave.addEventListener('click', () => {
    if(!postTitle.value || !postContent.value) return alert("제목과 내용을 입력하십시오.");

    let posts = getAllPosts();
    
    if(isEditMode) {
        posts[currentPostIndex].title = postTitle.value;
        posts[currentPostIndex].content = postContent.value;
        posts[currentPostIndex].category = postCategory.value;
    } else {
        const newPost = {
            title: postTitle.value,
            content: postContent.value,
            category: postCategory.value,
            date: new Date().toLocaleDateString('ko-KR') // YYYY. MM. DD. 형식
        };
        posts.unshift(newPost); // 최신 글을 맨 앞에 추가
    }

    saveAllPosts(posts);
    modal.style.display = 'none';
    
    if(isEditMode) {
        openDetailView(currentPostIndex);
    } else {
        renderDashboard();
    }
});

// --- 상세 읽기 화면 열기 ---
function openDetailView(index) {
    currentPostIndex = index;
    const posts = getAllPosts();
    const post = posts[index];

    viewMain.style.display = 'none';
    viewDetail.style.display = 'block';

    detailTitle.innerText = post.title;
    detailDate.innerText = post.date;
    detailCategory.innerText = post.category;
    detailBody.innerHTML = marked.parse(post.content);

    generateTOC();
    
    // 스크롤 맨 위로 올리기
    window.scrollTo(0, 0);
}

// --- 뒤로가기 버튼 ---
btnBackMain.addEventListener('click', () => {
    viewDetail.style.display = 'none';
    viewMain.style.display = 'block';
    renderDashboard();
});

// --- 상세 뷰 - 글 삭제 ---
btnDetailDelete.addEventListener('click', () => {
    if(confirm("이 게시글을 삭제하시겠습니까?")) {
        let posts = getAllPosts();
        posts.splice(currentPostIndex, 1);
        saveAllPosts(posts);
        btnBackMain.click();
    }
});

// --- 상세 뷰 - 글 수정 ---
btnDetailEdit.addEventListener('click', () => {
    isEditMode = true;
    const posts = getAllPosts();
    const post = posts[currentPostIndex];
    
    modalHeading.innerText = "글 수정";
    postTitle.value = post.title;
    postCategory.value = post.category;
    postContent.value = post.content;
    
    modal.style.display = 'flex';
});

// 3. 필터 버튼 이벤트 리스너 추가
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 버튼 활성화 상태 변경
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 선택된 카테고리 저장 및 렌더링
        activeCategory = btn.getAttribute('data-category');
        renderDashboard(document.getElementById('search-input').value);
    });
});

// 초기화
renderDashboard();

// ==========================================
// 7. [라이브 텔레메트리] GitHub API 통신 엔진
// ==========================================
async function fetchGitHubStats() {
    const username = 'jokers-data'; // 지휘관님의 GitHub ID
    const apiUrl = `https://api.github.com/users/${username}`;

    try {
        console.log("🛰️ Connecting Github...");
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error('Connection Failed');
        
        const data = await response.json();

        // 실시간 데이터 바인딩
        document.getElementById('gh-repos').innerText = data.public_repos;
        document.getElementById('gh-followers').innerText = data.followers;
        document.getElementById('gh-gists').innerText = data.public_gists;
        
        console.log("✅ Successs Telemetry");
    } catch (error) {
        console.error("⚠️ Telemetry Response Error!:", error);
        document.querySelectorAll('.stat-item span[id]').forEach(el => el.innerText = 'ERR');
    }
}

// 기지 가동 시 즉시 수신 시작
fetchGitHubStats();

// ==========================================
// 8. [기상 관측소] Open-Meteo API 통신
// ==========================================
async function fetchWeather() {
    // 서울(37.56, 126.97)과 부산(35.17, 129.07)의 위도/경도
    const url = "https://api.open-meteo.com/v1/forecast?latitude=37.5665,35.1796&longitude=126.9780,129.0756&current_weather=true";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('날씨 위성 교신 실패');
        
        // 배열 배열 형태로 리턴됨: data[0]은 서울, data[1]은 부산
        const data = await response.json(); 
        
        // 날씨 코드를 직관적인 이모지로 변환하는 함수
        const getWeatherEmoji = (code) => {
            if (code === 0) return '☀️'; // 맑음
            if (code >= 1 && code <= 3) return '☁️'; // 구름조금/많음
            if (code >= 51 && code <= 67) return '🌧️'; // 비
            if (code >= 71 && code <= 77) return '❄️'; // 눈
            if (code >= 95) return '⛈️'; // 뇌우
            return '🌫️'; // 기타/흐림
        };

        const seoulTemp = data[0].current_weather.temperature;
        const seoulEmoji = getWeatherEmoji(data[0].current_weather.weathercode);
        
        const busanTemp = data[1].current_weather.temperature;
        const busanEmoji = getWeatherEmoji(data[1].current_weather.weathercode);

        // 화면에 바인딩
        document.getElementById('weather-seoul').innerText = `${seoulEmoji} ${seoulTemp}°C`;
        document.getElementById('weather-busan').innerText = `${busanEmoji} ${busanTemp}°C`;

    } catch (error) {
        console.error("⚠️ 기상 레이더 에러:", error);
        document.getElementById('weather-seoul').innerText = 'ERR';
        document.getElementById('weather-busan').innerText = 'ERR';
    }
}

// 기지 가동 시 날씨 데이터 즉시 수신
fetchWeather();