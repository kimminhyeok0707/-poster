

document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://127.0.0.1:5001'; 

    
    const postForm = document.getElementById('post-form');
    const postIdInput = document.getElementById('post-id');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const postList = document.getElementById('post-list');

    
    const resetForm = () => {
        postIdInput.value = '';
        titleInput.value = '';
        contentInput.value = '';
        submitBtn.textContent = '글쓰기';
        cancelBtn.classList.add('hidden');
    };

    
    const fetchPosts = async () => {
        try {
            const response = await fetch(`${apiUrl}/posts`);
            if (!response.ok) {
                throw new Error('게시글 목록을 불러오는데 실패했습니다.');
            }
            const posts = await response.json();
            
            postList.innerHTML = ''; 
            posts.forEach(post => {
                const li = document.createElement('li');
                li.className = 'post-item';
                li.dataset.id = post.id;

                li.innerHTML = `
                    <div class="post-item-header">
                        <h3>${post.title}</h3>
                        <span>작성일: ${post.created_at}</span>
                    </div>
                    <p class="post-item-content">${post.content}</p>
                    <div class="post-item-actions">
                        <button class="edit-btn">수정</button>
                        <button class="delete-btn">삭제</button>
                    </div>
                `;
                postList.appendChild(li);
            });
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };
    
    
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = postIdInput.value;
        const title = titleInput.value;
        const content = contentInput.value;
        
        const isEditing = id !== '';
        const url = isEditing ? `${apiUrl}/posts/${id}` : `${apiUrl}/posts`;
        const method = isEditing ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });
            
            if (!response.ok) {
                throw new Error(isEditing ? '수정에 실패했습니다.' : '작성에 실패했습니다.');
            }
            
            resetForm();
            fetchPosts(); 
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    
    postList.addEventListener('click', async (e) => {
        const target = e.target;
        const postItem = target.closest('.post-item');
        if (!postItem) return;

        const id = postItem.dataset.id;
        
       
        if (target.classList.contains('delete-btn')) {
            if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                try {
                    const response = await fetch(`${apiUrl}/posts/${id}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) {
                        throw new Error('삭제에 실패했습니다.');
                    }
                    fetchPosts(); 
                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            }
        }
        
       
        if (target.classList.contains('edit-btn')) {
            
            const title = postItem.querySelector('h3').textContent;
            const content = postItem.querySelector('p').textContent;
            
            
            postIdInput.value = id;
            titleInput.value = title;
            contentInput.value = content;
            
            submitBtn.textContent = '수정 완료';
            cancelBtn.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    });

   
    cancelBtn.addEventListener('click', resetForm);

    
    fetchPosts();
});
