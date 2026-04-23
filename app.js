// app.js

// 1. 뷰 스위치 요소
const viewMain = document.getElementById('main-view');
const viewDetail = document.getElementById('detail-view');

// 2. 모달 및 입력 요소
const modal = document.getElementById('post-modal');
const modalCategory = document.getElementById('modal-category');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const btnSave = document.getElementById('btn-save');
const btnClose = document.getElementById('btn-close');

// 3. 상세 뷰 요소
const detailCategory = document.getElementById('detail-category');
const detailTitle = document.getElementById('detail-title');
const detailDate = document.getElementById('detail-date');
const detailBody = document.getElementById('detail-body');
const btnBackMain = document.getElementById('btn-back-main');
const btnPrevPost = document.getElementById('btn-prev-post');
const btnNextPost = document.getElementById('btn-next-post');
const btnDetailEdit = document.getElementById('btn-detail-edit');
const btnDetailDelete = document.getElementById('btn-detail-delete');

// 전역 상태 관리 변수
let currentCategory = ''; 
let currentPostIndex = -1; // 현재 보고 있는 글의 배열 내 위치
let isEditMode = false; // 새글 작성인지 수정인지 구분

// --- [코어 함수] 로컬 스토리지에서 데이터 불러오기 (배열 형태) ---
function getPosts(category) {
    const data = localStorage.getItem('jokers_posts_' + category);
    return data ? JSON.parse(data) : [];
}

// --- [코어 함수] 로컬 스토리지에 데이터 저장하기 ---
function savePosts(category, postsArray) {
    localStorage.setItem('jokers_posts_' + category, JSON.stringify(postsArray));
}

// --- [뷰 함수] 메인 화면의 카드 리스트 렌더링 ---
function renderDashboard() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const ul = card.querySelector('.post-list');
        const posts = getPosts(category);
        
        ul.innerHTML = ''; // 기존 리스트 초기화
        
        posts.forEach((post, index) => {
            const li = document.createElement('li');
            li.innerText = post.title;
            // 리스트 제목 클릭 시 상세 뷰 열기
            li.addEventListener('click', () => openDetailView(category, index));
            ul.appendChild(li);
        });
    });
}

// --- [액션] 카드에서 새 글 작성(+) 버튼 클릭 ---
document.querySelectorAll('.btn-add-post').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentCategory = e.target.closest('.card').getAttribute('data-category');
        isEditMode = false;
        
        modalCategory.innerText = currentCategory + " - 새 글 작성";
        postTitle.value = '';
        postContent.value = '';
        
        modal.style.display = 'flex';
    });
});

// --- [액션] 모달창에서 저장(배포) 버튼 클릭 ---
btnSave.addEventListener('click', () => {
    if(!postTitle.value || !postContent.value) return alert("제목과 내용을 입력하십시오.");

    let posts = getPosts(currentCategory);
    
    if(isEditMode) {
        // 기존 글 수정
        posts[currentPostIndex].title = postTitle.value;
        posts[currentPostIndex].content = postContent.value;
    } else {
        // 새 글 추가
        const newPost = {
            title: postTitle.value,
            content: postContent.value,
            date: new Date().toLocaleString()
        };
        posts.unshift(newPost); // 최신 글을 맨 위(배열 앞)에 추가
    }

    savePosts(currentCategory, posts);
    modal.style.display = 'none';
    
    if(isEditMode) {
        openDetailView(currentCategory, currentPostIndex); // 수정 후 다시 뷰로
    } else {
        renderDashboard(); // 메인 화면 갱신
    }
});

// 모달 닫기
btnClose.addEventListener('click', () => modal.style.display = 'none');

// --- [뷰 함수] 상세 읽기 화면 열기 (이전/다음 로직 포함) ---
function openDetailView(category, index) {
    currentCategory = category;
    currentPostIndex = index;
    const posts = getPosts(category);
    const post = posts[index];

    // 화면 스위치 전환
    viewMain.style.display = 'none';
    viewDetail.style.display = 'block';

    // 데이터 채우기
    detailCategory.innerText = category;
    detailTitle.innerText = post.title;
    detailDate.innerText = post.date;
    detailBody.innerText = post.content;

    // 네비게이션 버튼 상태 처리
    btnPrevPost.disabled = (index === posts.length - 1); // 더 이상 예전 글이 없으면 비활성
    btnNextPost.disabled = (index === 0); // 더 이상 최신 글이 없으면 비활성
}

// --- [액션] 상세 뷰 - 메인으로 돌아가기 ---
btnBackMain.addEventListener('click', () => {
    viewDetail.style.display = 'none';
    viewMain.style.display = 'block';
    renderDashboard();
});

// --- [액션] 상세 뷰 - 이전/다음 글 넘기기 ---
btnPrevPost.addEventListener('click', () => openDetailView(currentCategory, currentPostIndex + 1));
btnNextPost.addEventListener('click', () => openDetailView(currentCategory, currentPostIndex - 1));

// --- [액션] 상세 뷰 - 글 삭제 ---
btnDetailDelete.addEventListener('click', () => {
    if(confirm("이 게시글을 삭제하시겠습니까?")) {
        let posts = getPosts(currentCategory);
        posts.splice(currentPostIndex, 1); // 배열에서 해당 인덱스 삭제
        savePosts(currentCategory, posts);
        
        btnBackMain.click(); // 삭제 후 메인으로 튕겨내기
    }
});

// --- [액션] 상세 뷰 - 글 수정 ---
btnDetailEdit.addEventListener('click', () => {
    isEditMode = true;
    const posts = getPosts(currentCategory);
    
    modalCategory.innerText = currentCategory + " - 글 수정";
    postTitle.value = posts[currentPostIndex].title;
    postContent.value = posts[currentPostIndex].content;
    
    modal.style.display = 'flex';
});

// 초기화: 스크립트가 로드되면 대시보드 먼저 렌더링
renderDashboard();