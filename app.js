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

// 상태 관리
let currentPostIndex = -1; 
let isEditMode = false;

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
    postGrid.innerHTML = ''; // 그리드 초기화

    posts.forEach((post, index) => {
        // 검색 필터링 로직
        if(searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase())) return;

        // 본문 요약 (150자)
        const summary = post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content;

        // 카드 생성
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
            <div class="post-card-header">
                <h3>${post.title}</h3>
                <span class="post-card-date">${post.date}</span>
            </div>
            <p class="post-card-summary">${summary}</p>
        `;
        
        // 카드 클릭 시 상세 뷰로 이동
        card.addEventListener('click', () => openDetailView(index));
        postGrid.appendChild(card);
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
    detailBody.innerText = post.content;
    
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

// 초기화
renderDashboard();