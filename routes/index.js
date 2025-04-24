var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const boardModel = require('./board');
const passport = require('passport');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require('./multer');

router.get('/', function (req, res){
    res.render('index');
})

router.get('/login', function (req, res){
    res.render('login', { error: req.flash('error') });
})

router.get('/register', function (req, res){
    res.render('register');
})

router.get('/profile', isLoggedIn, async function (req, res){
    let user = await userModel.findOne({
        username: req.session.passport.user
    });
  
    res.render('profile', { user });
})

router.get('/boards', isLoggedIn, async function (req, res) {
    const user = await userModel.findOne({
        username: req.session.passport.user
    })
    .populate({
        path: 'boards',
        populate: {
          path: 'posts'
        }
      });
    res.render('boards', { user });
})

router.get('/pins', isLoggedIn, async function (req, res) {
    const user = await userModel.findOne({
        username: req.session.passport.user
    })
    .populate('pins');
    res.render('pins', { user });
})

router.get('/feed', isLoggedIn, async function (req, res){
    const user = await userModel.findOne({
        username: req.session.passport.user
    });
    const posts = await postModel.find({
        user: {
            $ne: user._id
        }
    }).populate('user');
    res.render('feed', { posts });
})

router.get('/addpost/:id', isLoggedIn, function (req, res){
    res.render('addpost', { id: req.params.id });
})

router.get('/seepost/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    const post = await postModel.findById(id);
    res.render('seepost', { post });
})

router.get('/yourpost/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    const post = await postModel.findById(id);
    res.render('yourpost', { post });
})

router.get('/pin/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    const post = await postModel.findById(id);
    if(post.pins == 0)  
    {
        post.pins = 1;
        const user = await userModel.findOne({
            username: req.session.passport.user
        });
        await post.save();
        user.pins.push(id);
        await user.save();
        res.redirect(`/seepost/${id}`);
    }
    else    res.redirect(`/seepost/${id}`);
})

router.post('/uploaddp', upload.single('dp'), async function (req, res) {
    if(!req.file){
        return res.status(404).send("Error in uploading DP");
    }
    const user = await userModel.findOne({
        username: req.session.passport.user
    });
    user.dp = req.file.filename;
    await user.save();
    res.redirect('/profile');
})

router.post('/upload/:id', isLoggedIn, upload.single('postimage'), async (req, res) => {
    if(!req.file){
        return res.status(404).send("Upload Failed");
    }
    const id = req.params.id;
    const user = await userModel.findOne({
        username: req.session.passport.user
    });
    console.log(user);
    const board = await boardModel.findById(id);
    console.log(board);
    const post = await postModel.create({
        postImage: req.file.filename,
        postTitle: req.body.posttitle,
        postDescription: req.body.postdescription,
        user: user._id,
        board: id
    });
    console.log(post);
    user.posts.push(post._id);
    await user.save();
    board.posts.push(post._id);
    await board.save();
    res.redirect(`/viewboard/${id}`)
})

router.get('/addboard', isLoggedIn, function(req, res){
    res.render('board');
})

router.get('/closeboard', isLoggedIn, function(req, res){
    res.redirect('/boards');
})

router.post('/createboard', isLoggedIn, async function (req, res){
    const user = await userModel.findOne({
        username: req.session.passport.user
    });
    const board = await boardModel.create({
        boardName: req.body.boardname,
        user: user._id
    });
    user.boards.push(board._id);
    await user.save();
    res.redirect('/profile');
})

router.get('/viewboard/:id', isLoggedIn, async function (req, res){
    const boardId = req.params.id;
    console.log(boardId);
    const boards = await boardModel.findOne({
        _id: boardId
    }).populate('posts')
    .populate('user');
    console.log(boards);
    res.render('viewboard', { boards: boards });
})

router.post('/register', function (req, res){
    const userData = new userModel({
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email
    });

    userModel.register(userData, req.body.password)
    .then(function(){
        passport.authenticate("local")(req, res, function(){
            res.redirect('/profile');
        })
    })
})

router.post('/login', passport.authenticate("local", {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/logout', function(req, res, next){
    req.logout(function(err){
      if(err) return next(err);
      res.redirect('/');
    })
  })
  
  function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/login');
  }

module.exports = router;