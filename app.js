// ==========================================
// 1. DOM 요소 선택 (하드웨어 연결)
// ==========================================
const viewMain = document.getElementById('main-view');
const viewDetail = document.getElementById('detail-view');

const modal = document.getElementById('post-modal');
const modalHeading = document.getElementById('modal-heading');
const postCategory = document.getElementById('post-category');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const btnNewPost = document.getElementById('btn-new-post');
const btnSave = document.getElementById('btn-save');
const btnClose = document.getElementById('btn-close');

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

// ==========================================
// 2. 상태 관리 (관제탑 메모리)
// ==========================================
let currentPostIndex = -1; 
let isEditMode = false;
let activeCategory = 'All';
let currentSearchQuery = '';
let fuse; // 지능형 검색 엔진

// ==========================================
// 3. 데이터베이스 (블랙박스 로컬 스토리지)
// ==========================================
const DB_KEY = 'jokers_posts'; // 🔑 저장소 이름 통일!

function getAllPosts() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
}

function saveAllPosts(posts) {
    localStorage.setItem(DB_KEY, JSON.stringify(posts));
    if (fuse) fuse.setCollection(posts); // 저장될 때 검색 엔진 데이터도 업데이트
}

// ==========================================
// 4. 화면 렌더링 및 검색 엔진
// ==========================================
function initSearchEngine(posts) {
    const options = {
        keys: ['title', 'content', 'category'],
        threshold: 0.3
    };
    fuse = new Fuse(posts, options);
}

// 🎯 통합 렌더링 함수 (카테고리 + 검색어 동시 적용)
function renderDashboard() {
    let posts = getAllPosts();

    // 1차 필터링: 카테고리
    if (activeCategory !== 'All') {
        posts = posts.filter(post => post.category === activeCategory);
    }

    // 2차 필터링: 지능형 검색
    if (currentSearchQuery.trim() !== '') {
        const results = fuse.search(currentSearchQuery);
        posts = results.map(result => result.item);
    }

    postGrid.innerHTML = ''; 

    posts.forEach((post) => {
        // 배열이 필터링되어도 '원본' 인덱스를 찾아갈 수 있도록 추적
        const realIndex = getAllPosts().findIndex(p => p.title === post.title && p.date === post.date);
        
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
        // 클릭 시 진짜 인덱스 번호로 상세 화면 열기
        card.addEventListener('click', () => openDetailView(realIndex));
        postGrid.appendChild(card);
    });
}

// ⌨️ 검색어 입력 이벤트
searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    renderDashboard();
});

// 🏷️ 카테고리 버튼 이벤트
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        renderDashboard();
    });
});

// ==========================================
// 5. 게시글 CRUD (생성, 읽기, 수정, 삭제)
// ==========================================
btnNewPost.addEventListener('click', () => {
    isEditMode = false;
    modalHeading.innerText = "새 글 작성";
    postTitle.value = '';
    postCategory.value = '';
    postContent.value = '';
    modal.style.display = 'flex';
});

btnClose.addEventListener('click', () => modal.style.display = 'none');

btnSave.addEventListener('click', () => {
    if(!postTitle.value || !postContent.value) return alert("제목과 내용을 입력하십시오.");

    let posts = getAllPosts();
    
    if(isEditMode) {
        posts[currentPostIndex].title = postTitle.value;
        posts[currentPostIndex].content = postContent.value;
        posts[currentPostIndex].category = postCategory.value || 'Uncategorized';
    } else {
        const newPost = {
            title: postTitle.value,
            content: postContent.value,
            category: postCategory.value || 'Uncategorized',
            date: new Date().toLocaleDateString('ko-KR')
        };
        posts.unshift(newPost); // 최신 글을 맨 앞으로
    }

    saveAllPosts(posts);
    modal.style.display = 'none';
    
    if(isEditMode) {
        openDetailView(currentPostIndex);
    } else {
        // 새 글 작성 후 메인 화면 리셋
        activeCategory = 'All';
        filterBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-category="All"]').classList.add('active');
        searchInput.value = '';
        currentSearchQuery = '';
        renderDashboard();
    }
});

function openDetailView(index) {
    currentPostIndex = index;
    const posts = getAllPosts();
    const post = posts[index];

    viewMain.style.display = 'none';
    viewDetail.style.display = 'block';

    detailTitle.innerText = post.title;
    detailDate.innerText = post.date;
    detailCategory.innerText = post.category || 'Uncategorized';
    detailBody.innerHTML = marked.parse(post.content);

    generateTOC();
    window.scrollTo(0, 0);
}

btnBackMain.addEventListener('click', () => {
    viewDetail.style.display = 'none';
    viewMain.style.display = 'block';
    renderDashboard();
});

// 🗑️ 통합된 삭제 로직 (안전장치 포함)
btnDetailDelete.addEventListener('click', () => {
    const posts = getAllPosts();
    const titleToDelete = posts[currentPostIndex].title;

    if(confirm(`경고: [${titleToDelete}] 게시글을 영구 삭제하시겠습니까?`)) {
        posts.splice(currentPostIndex, 1);
        saveAllPosts(posts);
        alert('데이터 소각 완료.');
        btnBackMain.click(); // 삭제 후 자동으로 메인 복귀
    }
});

btnDetailEdit.addEventListener('click', () => {
    isEditMode = true;
    const posts = getAllPosts();
    const post = posts[currentPostIndex];
    
    modalHeading.innerText = "글 수정";
    postTitle.value = post.title;
    postCategory.value = post.category || '';
    postContent.value = post.content;
    
    modal.style.display = 'flex';
});

// ==========================================
// 6. UI 유틸리티 (네온사인, 카멜레온, 목차 등)
// ==========================================
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

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

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    document.getElementById('progress-bar').style.width = scrolled + '%';
});

function generateTOC() {
    const tocContainer = document.getElementById('toc-container');
    const tocList = document.getElementById('toc-list');
    tocList.innerHTML = ''; 

    const headers = detailBody.querySelectorAll('h1, h2, h3');
    if(headers.length === 0) {
        tocContainer.style.display = 'none'; 
        return;
    }

    tocContainer.style.display = 'block'; 
    headers.forEach((header, index) => {
        header.id = 'heading-' + index; 
        const link = document.createElement('a');
        link.href = '#' + header.id;
        link.innerText = header.innerText;
        link.className = header.tagName.toLowerCase(); 
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        tocList.appendChild(link);
    });
}

// ==========================================
// 7. 외부 통신 (GitHub & 날씨)
// ==========================================
async function fetchGitHubStats() {
    const username = 'jokers-data'; 
    const apiUrl = `https://api.github.com/users/${username}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Connection Failed');
        
        const data = await response.json();
        document.getElementById('gh-repos').innerText = data.public_repos;
        document.getElementById('gh-followers').innerText = data.followers;
        document.getElementById('gh-gists').innerText = data.public_gists;
    } catch (error) {
        console.error("⚠️ 깃허브 통신 에러:", error);
    }
}

async function fetchWeather() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=37.5665,35.1796&longitude=126.9780,129.0756&current_weather=true";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('날씨 위성 교신 실패');
        
        const data = await response.json(); 
        const getWeatherEmoji = (code) => {
            if (code === 0) return '☀️'; 
            if (code >= 1 && code <= 3) return '☁️'; 
            if (code >= 51 && code <= 67) return '🌧️'; 
            if (code >= 71 && code <= 77) return '❄️'; 
            if (code >= 95) return '⛈️'; 
            return '🌫️'; 
        };

        const seoulTemp = data[0].current_weather.temperature;
        const seoulEmoji = getWeatherEmoji(data[0].current_weather.weathercode);
        const busanTemp = data[1].current_weather.temperature;
        const busanEmoji = getWeatherEmoji(data[1].current_weather.weathercode);

        document.getElementById('weather-seoul').innerText = `${seoulEmoji} ${seoulTemp}°C`;
        document.getElementById('weather-busan').innerText = `${busanEmoji} ${busanTemp}°C`;
    } catch (error) {
        console.error("⚠️ 기상 통신 에러:", error);
    }
}

// ==========================================
// 8. 🚀 관제탑 통합 부팅 엔진
// ==========================================
function initBaseCamp() {
    console.log("🟢 관제탑 부팅 시퀀스 시작...");
    try {
        fetchWeather();
        fetchGitHubStats();

        const posts = getAllPosts();
        if (typeof Fuse !== 'undefined') {
            initSearchEngine(posts);
        }

        renderDashboard();
        console.log("✅ 모든 시스템 정상 부팅 완료!");
    } catch (error) {
        console.error("🚨 부팅 중 치명적 에러 발생:", error);
    }
}

// HTML 뼈대가 준비되면 엔진 즉시 가동!
document.addEventListener('DOMContentLoaded', initBaseCamp);