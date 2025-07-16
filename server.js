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
        res.status(500).json({message: "게시글을 불러오는데 실패했습니다."});
    }
});

// 새로운 게시글 작성하기
app.post('/posts', async (req, res) => {
    try {
        const {title, content} = req.body;
        //Post 테이블에 새로운 데이터 생성
        const newPost = await Post.create({title, content});
        res.status(201).json(newPost);
    } catch (error) {
        console.error("게시글 작성 중 오류:", error); // 터미널에 에러 로그 출력
        res.status(500).json({message: "게시글 작성에 실패했습니다."})
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

startServer();