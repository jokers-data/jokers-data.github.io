// app.js

// 1. 관제탑 요소들 레이더 포착
const cards = document.querySelectorAll('.card');
const searchInput = document.querySelector('.search-input'); // 검색창 포착
const modal = document.getElementById('post-modal');
const modalCategory = document.getElementById('modal-category');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const readContent = document.getElementById('read-content');

const btnClose = document.getElementById('btn-close');
const btnSave = document.getElementById('btn-save');
const btnEdit = document.getElementById('btn-edit');     // 수정 버튼
const btnDelete = document.getElementById('btn-delete'); // 삭제 버튼

let currentCategory = ''; 

// 🎯 신규 무기 1: 실시간 검색 레이더 (Search)
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase(); // 입력한 글자를 소문자로 변환
    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        // 카드의 제목이 검색어를 포함하고 있으면 보여주고, 아니면 숨김 처리
        if (title.includes(searchTerm)) {
            card.style.display = 'block'; 
        } else {
            card.style.display = 'none';  
        }
    });
});

// 2. 카드 클릭 시 작동할 로직
cards.forEach(card => {
    card.addEventListener('click', () => {
        currentCategory = card.querySelector('h3').innerText; 
        modalCategory.innerText = currentCategory + " 기술 일지";

        const savedData = JSON.parse(localStorage.getItem('jokers_post_' + currentCategory));

        if (savedData) {
            // [읽기 모드] 글이 이미 있을 때
            postTitle.style.display = 'none';
            postContent.style.display = 'none';
            btnSave.style.display = 'none';
            readContent.style.display = 'block';
            
            // 수정, 삭제 버튼 표시
            btnEdit.style.display = 'block';
            btnDelete.style.display = 'block';
            
            readContent.innerHTML = `<h3 style="margin-top:0; color:#fff;">${savedData.title}</h3><p style="color:#aaa;">${savedData.content}</p>`;
        } else {
            // [쓰기 모드] 글이 없을 때
            postTitle.style.display = 'block';
            postContent.style.display = 'block';
            btnSave.style.display = 'block';
            readContent.style.display = 'none';
            
            // 쓰기 모드일 땐 수정, 삭제 숨김
            btnEdit.style.display = 'none';
            btnDelete.style.display = 'none';
            
            postTitle.value = '';
            postContent.value = '';
        }

        modal.style.display = 'flex';
    });
});

// 3. 저장(배포) 버튼 로직
btnSave.addEventListener('click', () => {
    if(postTitle.value === '' || postContent.value === '') {
        alert("지휘관! 제목과 내용을 모두 입력해야 배포할 수 있습니다.");
        return;
    }

    const postData = {
        title: postTitle.value,
        content: postContent.value,
        time: "Written"
    };

    localStorage.setItem('jokers_post_' + currentCategory, JSON.stringify(postData));

    cards.forEach(card => {
        if(card.querySelector('h3').innerText === currentCategory) {
            card.style.borderColor = "#32D74B";
            card.querySelector('.card-time').innerText = "Written";
            card.querySelector('.card-time').style.color = "#32D74B";
        }
    });

    alert("배포 완료! 데이터가 성공적으로 적재되었습니다.");
    modal.style.display = 'none';
});

// 🛠️ 신규 무기 2: 수정(Edit) 프로토콜
btnEdit.addEventListener('click', () => {
    const savedData = JSON.parse(localStorage.getItem('jokers_post_' + currentCategory));
    
    // 읽기 화면 숨기고, 입력창 띄우기
    readContent.style.display = 'none';
    postTitle.style.display = 'block';
    postContent.style.display = 'block';
    
    // 기존 데이터 텍스트 박스에 다시 채워넣기
    postTitle.value = savedData.title;
    postContent.value = savedData.content;

    // 버튼 교체 (수정/삭제 숨기고 저장 버튼 띄우기)
    btnEdit.style.display = 'none';
    btnDelete.style.display = 'none';
    btnSave.style.display = 'block';
});

// 💣 신규 무기 3: 삭제(Delete) 프로토콜
btnDelete.addEventListener('click', () => {
    // 실수로 지우지 않도록 경고창 띄우기
    if(confirm("경고! 정말 이 기술 일지를 영구 폭파(삭제)하시겠습니까?")) {
        // DB(로컬 스토리지)에서 데이터 날리기
        localStorage.removeItem('jokers_post_' + currentCategory);
        
        // 카드 UI 초기화 (초록색 빛 빼고 원래대로 복구)
        cards.forEach(card => {
            if(card.querySelector('h3').innerText === currentCategory) {
                card.style.borderColor = "#3f414d";
                card.querySelector('.card-time').innerText = "Just now";
                card.querySelector('.card-time').style.color = "#888";
            }
        });

        alert("삭제 완료. 해당 카드가 초기화되었습니다.");
        modal.style.display = 'none';
    }
});

// 4. 닫기 버튼 로직
btnClose.addEventListener('click', () => {
    modal.style.display = 'none';
});