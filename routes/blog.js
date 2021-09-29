const express = require("express");
const methodOverride = require("method-override");
//const { findById } = require("../DB/blog-model.js");
const Blog = require("../DB/blog-model.js");
const router = express.Router({ strict: true });
const { authRoute, checkUser } = require("../middleware/authorize-routes.js");

router.use(methodOverride('_method'));
router.use(express.static('public'));
router.use('/edit/', express.static('public'));

/* Conditional route, depending on user */

router.get("/", checkUser, (req, res) => {
  Blog.find().sort({ createdAt: -1 })
    .then((result) => {
      res.render('blog', { title: 'Blog', blogs: result });
    })
    .catch((err) => {
      console.log(err);
    })
});

/* Protected route */

router.get("/create", authRoute, (req, res) => {
  res.render('create', { title: 'Create new blog', blogPost: new Blog() });
});

/* Conditional route, depending on user */

router.get("/:slug", checkUser, (req, res) => {
  Blog.findOne({ slug: req.params.slug }).
    then((result) => {
      if (result == null) { res.redirect('/blog'); return }
      res.render('show', { title: result.title, blogPost: result })
    })
    .catch((err) => {
      res.redirect('/blog');
      console.log(err);
    })
});


/* Protected routes */

router.get("/edit/:id", authRoute, async (req, res) => {
  const blogPost = await Blog.findById(req.params.id)
  res.render('edit', { title: 'Edit post ', blogPost: blogPost });
});

router.post("/", authRoute, async (req, res, next) => {
  req.blogPost = new Blog();
  next()
}, saveAndRedirect('create'));


router.put('/:id', authRoute, async (req, res, next) => {
  req.blogPost = await Blog.findById(req.params.id);
  next()
}, saveAndRedirect('edit'));

/* Take request form data and insert/override into 'empty / older' request blogPost object */

function saveAndRedirect(path) {
  return async (req, res) => {
    let blogPost = req.blogPost
    blogPost.title = req.body.title
    blogPost.markdown = req.body.markdown
    blogPost.snippet = req.body.snippet
    try {
      blogPost = await blogPost.save();
      res.redirect(`/blog/${blogPost.slug}`);
    } catch (e) {
      console.log(e);
      res.render(path, { title: 'Create new blog', blogPost: blogPost })
    }
  }
}

router.delete('/:id', authRoute, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/blog/');
});

module.exports = router;