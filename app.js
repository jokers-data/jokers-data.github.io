// app.js

// 1. 관제탑 요소들 레이더 포착
const cards = document.querySelectorAll('.card');
const modal = document.getElementById('post-modal');
const modalCategory = document.getElementById('modal-category');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const readContent = document.getElementById('read-content');
const btnClose = document.getElementById('btn-close');
const btnSave = document.getElementById('btn-save');

let currentCategory = ''; // 현재 누른 카드의 이름 기억

// 2. 카드 클릭 시 작동할 로직
cards.forEach(card => {
    card.addEventListener('click', () => {
        // 카드의 h3 태그(예: Grafana) 글자를 가져옴
        currentCategory = card.querySelector('h3').innerText; 
        modalCategory.innerText = currentCategory + " 기술 일지";

        // 로컬 스토리지(브라우저 DB)에서 해당 카드의 저장된 글이 있는지 확인
        const savedData = JSON.parse(localStorage.getItem('jokers_post_' + currentCategory));

        if (savedData) {
            // 글이 이미 있으면 [읽기 모드]로 전환
            postTitle.style.display = 'none';
            postContent.style.display = 'none';
            btnSave.style.display = 'none';
            readContent.style.display = 'block';
            
            readContent.innerHTML = `<h3 style="margin-top:0; color:#fff;">${savedData.title}</h3><p style="color:#aaa;">${savedData.content}</p>`;
        } else {
            // 글이 없으면 [쓰기 모드]로 전환
            postTitle.style.display = 'block';
            postContent.style.display = 'block';
            btnSave.style.display = 'block';
            readContent.style.display = 'none';
            
            postTitle.value = '';
            postContent.value = '';
        }

        // 팝업창 띄우기
        modal.style.display = 'flex';
    });
});

// 3. 저장 버튼 클릭 시 로직
btnSave.addEventListener('click', () => {
    if(postTitle.value === '' || postContent.value === '') {
        alert("제목과 내용을 모두 입력해야 배포할 수 있습니다.");
        return;
    }

    // 작성한 데이터를 객체로 묶음
    const postData = {
        title: postTitle.value,
        content: postContent.value,
        time: "Just now"
    };

    // 브라우저 로컬 스토리지에 저장 (Key: jokers_post_카테고리명)
    localStorage.setItem('jokers_post_' + currentCategory, JSON.stringify(postData));

    // 화면(카드)에 글이 작성되었음을 시각적으로 표시 (초록색 테두리 고정 및 제목 변경)
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

// 4. 닫기 버튼 로직
btnClose.addEventListener('click', () => {
    modal.style.display = 'none';
});