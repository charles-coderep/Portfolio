const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');
const marked = require('marked');

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    markdown: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    html: {
        type: String,
        required: true
    }
}, { timestamps: true });

blogSchema.pre('validate', function (next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    if (this.markdown) {
        this.html = marked(this.markdown);
    }
    next();
})

const Blog = mongoose.model('blogs', blogSchema);
module.exports = Blog;