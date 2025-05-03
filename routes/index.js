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
    res.render('register',{ error: "" });
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
    .populate({
        path: 'pins',
        populate: {
            path: 'user'
        }
    });
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
    const user = await userModel.findOne({
        username: req.session.passport.user
    })
    const post = await postModel.findById(id).populate('user');
    let pin = 0;
    if(user.pins.includes(id))
    {
        pin = 1;
    }
    res.render('seepost', { post: post, pin: pin });
})

router.get('/yourpost/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    const post = await postModel.findById(id);
    res.render('yourpost', { post });
})

router.get('/deletepost/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;

    try {
        const post = await postModel.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        const board = await boardModel.findById(post.board);
        if (board) {
            board.posts = board.posts.filter(postId => postId.toString() !== id);
            await board.save();
        }

        const user = await userModel.findById(post.user);
        if (user) {
            user.posts = user.posts.filter(postId => postId.toString() !== id);
            await user.save();
        }

        res.redirect(`/viewboard/${post.board}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting post');
    }
});


router.get('/pin/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    const post = await postModel.findById(id);
    const user = await userModel.findOne({
        username: req.session.passport.user
    });

    if (user.pins.includes(id)) {
        return res.redirect(`/seepost/${id}`);
    }

    post.pins += 1;
    await post.save();
    user.pins.push(id);
    await user.save();
    res.redirect(`/seepost/${id}`);
})

router.get('/unpin/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;
    const post = await postModel.findById(id);
    const user = await userModel.findOne({
        username: req.session.passport.user
    });

    post.pins -= 1;
    await post.save();
    user.pins = user.pins.filter(pinId => pinId.toString() !== id);
    await user.save();
    res.redirect(`/seepost/${id}`);
})

router.get('/editprofile', isLoggedIn, async function (req, res){
    let user = await userModel.findOne({
        username: req.session.passport.user
    });
    res.render('editpage', { user });
})

router.post('/editprofile', isLoggedIn, async function (req, res){
    let user = await userModel.findOne({
        username: req.session.passport.user
    });
    user.fullname = req.body.fullname;
    user.username = req.body.username;
    user.email = req.body.email;
    await user.save();
    res.redirect('/login');
})

router.get('/closeeditpage', isLoggedIn, function (req, res){
    res.redirect('/profile');
})

router.get('/deleteuser', isLoggedIn, async function (req, res){
    let user = await userModel.findOneAndDelete({
        username: req.session.passport.user
    });
    
    if (user && user.boards.length > 0) {
        for (let boardId of user.boards) {
            await boardModel.findByIdAndDelete(boardId);
        }
    }

    if (user && user.posts.length > 0) {
        for (let postId of user.posts) {
            await postModel.findByIdAndDelete(postId);
        }
    }

    if (user && user.pins.length > 0) {
        for (let pinId of user.pins) {
            await postModel.findByIdAndDelete(pinId);
        }
    }
    res.redirect('/');
})

router.post('/uploaddp', isLoggedIn, upload.single('dp'), async function (req, res) {
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
    res.redirect(`/viewboard/${board._id}`);
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

router.get('/deleteboard/:id', isLoggedIn, async function (req, res) {
    const id = req.params.id;

    try {
        const board = await boardModel.findByIdAndDelete(id);
        if (!board) {
            return res.status(404).send("Board not found");
        }

        const boardposts = board.posts;

        for (let postId of boardposts) {
            await postModel.findByIdAndDelete(postId);
        }

        const user = await userModel.findById(board.user);
        if (user) {
            user.boards = user.boards.filter(boardId => boardId.toString() !== id);
            user.posts = user.posts.filter(postId => !boardposts.includes(postId.toString()));
            await user.save();
        } else {
            console.log("User not found");
        }

        res.redirect('/boards');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error while deleting board");
    }
});


router.post('/register', function (req, res) {
    const userData = new userModel({
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email
    });

    userModel.register(userData, req.body.password, function (err, user) {
        if (err) {
            console.error('Registration error:', err.message);
            return res.render('register', { error: err.message });
        }

        passport.authenticate("local")(req, res, function () {
            res.redirect('/profile');
        });
    });
});


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