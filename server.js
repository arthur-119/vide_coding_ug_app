const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

// --- 데이터베이스 설정 ---
// SQL Lites 사용
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite' //ug_app 폴더에 database.splite 파일 생성 
});

// 'Post'라는 이름의 테이블(게시판) 모델 정의
const Post = sequelize.define('Post', {
    // 각 게시글은 title과 content 가짐
    title: {
        type: DataTypes.STRING, // 문자열 타입
        allowNull: false // 비어있으면 안됨
    },
    content: {
        type: DataTypes.TEXT // 긴 문자열 타입
    }
});

app.use(express.json());

// --- API 라우트 ---

app.get('/', (req, res) => {
    res.send('Hello, World!, 데이터베이스에 연결된 서버');
});

// --- 게시판 API ---

// 게시판 전체 목록 가져오기
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll(); //Post 테이블의 모든 데이터 찾기
        res.json(posts)
    } catch (error) {
        console.error("게시글 조회 중 오류:", error); // 터미널에 에러 로그 출력
        res.status(500).json({ message: "게시글을 불러오는데 실패했습니다." });
    }
});

// 새로운 게시글 작성하기
app.post('/posts', async (req, res) => {
    try {
        const { title, content } = req.body;
        //Post 테이블에 새로운 데이터 생성
        const newPost = await Post.create({ title, content });
        res.status(201).json(newPost);
    } catch (error) {
        console.error("게시글 작성 중 오류:", error); // 터미널에 에러 로그 출력
        res.status(500).json({ message: "게시글 작성에 실패했습니다." })
    }
});

// 서버가 시작될 때 데이터베이스와 동기화를 맞춤
const startServer = async () => {
    try {
        await sequelize.sync(); // post에 맞춰 테이블 생성/변경
        app.listen(port, () => {
            console.log(`http://localhost:${port}`);
        });
    } catch (error) {
        console.error("서버 시작 실패 : ", error);
    }
};

// 특정 게시글 하나만 가져오기 (GET)
app.get('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id; // 주소에서 id 값을 가져옴
        const post = await Post.findByPk(postId); // Primary Key(기본키, id)로 하나를 찾음

        if (post) {
            res.json(post); // 글을 찾았으면 응답
        } else {
            // 글을 못 찾았으면 404 에러 응답
            res.status(404).json({ message: "해당 게시글을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("특정 게시글 조회 중 오류:", error);
        res.status(500).json({ message: "서버에 오류가 발생했습니다." });
    }
});

// 특정 게시글 수정하기
app.put('/posts/:id', async (req, res) =>{
    try {
        const postId = req.params.id;
        const {title, content} = req.body; // 수정할 새로운 제목과 내용을 받음

        const post = await Post.findByPk(postId); // 먼저 해당 글을 찾음

        if (post) {
            // 글을 찾았으면, 내용을 업데이트하고 저장함
            post.title = title;
            post.content = content;
            await post.save();
            res.json(post); // 업데이트된 내용을 응답
        } else {
            res.status(404).json({message: "해당 글을 찾을 수 없습니다."});
        }
    } catch (error) {
        console.error("게시글 수정 중 오류 : ", error);
        res.status(500).json({message: "서버에 오류가 발생했습니다."});
    }
});

// 특정 게시물 삭제하기
app.delete('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId); // 저장할 글을 먼저 찾음

        if (post) {
            await post.destroy(); // 찾은 글을 데이터베이스에서 삭제함
            // 성공적으로 삭제했다는 메세지만 응답 (삭제후 데이터가 없으므로)
            res.status(204).send();
        } else {
            res.status(404).json({message: "해당 게시글을 찾을 수 없습니다."})
        }
    } catch (error) {
        console.error("게시글 삭제 중 오류 : ", error);
        res.status(500).json({message: "서버에 오류가 발생했습니다."});
    }
});

startServer();