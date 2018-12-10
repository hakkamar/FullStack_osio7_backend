const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
    .populate('comment', { blogi: 1, comment: 1 })

  response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if ( blog ) {
      response.json(Blog.format(blog))
    } else {
      response.status(404).end()
    }
  } catch ( exception ) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogRouter.post('/:id/comments', async (request, response) => {
  try {
    const kommentti = request.body.comment
    const blogi_iidee = request.body.blogi

    const comment = new Comment( { blogi: blogi_iidee, comment: kommentti } )
    const result = await comment.save()

    const blog = await Blog.findById(blogi_iidee)
    blog.comment = blog.comment.concat(comment)
    await blog.save()

    response.status(201).json(result)

  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went REALLY wrong...' })
    }
  }

})

blogRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body

  try {
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (title === undefined ||  url === undefined) {
      return response.status(400).json({ error: 'url or title missing' })
    }

    const user = await User.findById(decodedToken.id)
    const blog = new Blog({ title, author, url, likes: (likes || 0), user: user._id } )
    const result = await blog.save()

    user.blogs = user.blogs.concat(blog._id)
    await user.save()

    response.status(201).json(result)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  try {
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    if (decodedToken.id.toString() !== blog.user.toString()) {
      return response.status(400).json({ error: 'only creator can delete a blog' })
    }
    if (blog) {
      await blog.remove()
    }

    response.status(204).end()
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const blog = await Blog.findByIdAndUpdate(request.params.id, { title, author, url, likes } , { new: true })
  //const blog = await Blog.findOneAndUpdate({ _id: request.params.id }, { title, author, url, likes } , { new: true })

  response.send(blog)
})

module.exports = blogRouter