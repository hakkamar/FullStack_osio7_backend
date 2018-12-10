const mongoose = require('mongoose')

// korvaa url oman tietokantasi urlilla. ethän laita salasanaa Githubiin!
const url = 'mongodb://fullstack_osa4:sekred1@ds125502.mlab.com:25502/osa4'

mongoose.connect(url, { useNewUrlParser: true })
mongoose.Promise = global.Promise

const Blog = mongoose.model('Blog', {
  title: String,
  author: String,
  url: String,
  likes: Number
})

if (process.argv.length < 6) {
  Blog
    .find({})
    .then( blogs => {
      blogs.forEach( blog => {
        console.log(blog.title, blog.author, blog.url, blog.likes)
      })
      mongoose.connection.close()
    })
} else {
  const title = process.argv[2]
  const author = process.argv[3]
  const url = process.argv[4]
  const likes = process.argv[5]

  const blog = new Blog({
    title, author, url, likes
  })
  blog
    .save()
    .then(response => {
      console.log(`${response.title} saved!`)
      mongoose.connection.close()
    })
}