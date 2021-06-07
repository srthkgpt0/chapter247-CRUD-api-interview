const express = require('express')
const router = express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const userController = require('../controllers/user')
const upload = multer({ dest: __dirname + '/uploads/images' })
const uploadCSV = multer({ dest: __dirname + '/uploads/csv' })

// router.post("/signup", userController.addUser);
router.post('/signup', userController.addUser)

router.post('/user', userController.getToken)
router.post('/csv', auth, upload.single('file'), userController.importCsv)
router.get('/user', auth, userController.getUser)
router.patch('/user', auth, userController.updateProfile)
router.delete('/user', auth, userController.deleteUser)
router.get('/user/download-list', userController.csvExport)
router.post('/user/photo', upload.single('photo'), userController.addPhoto)
// router.post("/users", async (req, res) => {
//   const user = new User(req.body);
//   try {
//     await user.save();
//     // sendWelcomeEmail(user.email, user.name)
//     const token = await user.generateToken();
//     res.status(201).send({ user, token });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// router.post("/users/login", async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     // console.log(user)
//     if (!user) {
//       res.status(404).send({ error: "Unable to login" });
//     }
//     const isMatch = await bcrypt.compare(req.body.password, user.password);
//     console.log(isMatch);
//     if (!isMatch) {
//       res.status(404).send({ error: "Unable to login" });
//     }
//     // const user = await User.findByCredentials(req.body.email, req.body.password)

//     const token = await user.generateToken();

//     res.send({ user, token });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    )
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
  // try {
  //   const user = await User.find({})
  //   res.send(user)
  // } catch (error) {
  //   res.status(500).send()
  // }
})
// router.get('/users/:id', async (req, res) => {
//   const _id = req.params.id
//   try {
//     const user = await User.findById(_id)
//     if (!user) {
//       return res.status(404).send()
//     }
//     res.send(user)
//   } catch (error) {
//     res.status(500).send(e)
//   }
// })
// router.patch('/users/:id', auth, async (req, res) => {
//   const _id = req.params.id
//   const updates = Object.keys(req.body)
//   const allowedUpdates = ['name', 'email', 'password', 'age']
//   const isValidOperation = updates.every((update) =>
//     allowedUpdates.includes(update)
//   )
//   if (!isValidOperation) {
//     return res.status(400).send({
//       error: 'Invalid Updates!'
//     })
//   }
//   try {
//     const user = await User.findById(_id)
//     updates.forEach((update) => (user[update] = req.body[update]))
//     await user.save()

//     // const user = await User.findByIdAndUpdate(_id, req.body, {
//     //   new: true,
//     //   runValidators: true
//     // })
//     if (!user) {
//       return res.status(404).send()
//     }
//     res.send(user)
//   } catch (error) {
//     res.status(400).send(error)
//   }
// })
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  )
  if (!isValidOperation) {
    return res.status(400).send({
      error: 'Invalid Updates!'
    })
  }
  try {
    // const user = await User.findById(_id)
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()

    // const user = await User.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true
    // })

    res.send(req.user)
  } catch (error) {
    res.status(400).send(error)
  }
})
// router.delete('/users/:id', auth, async (req, res) => {
//   const _id = req.params.id
//   try {
//     const user = await User.findByIdAndDelete(_id)
//     if (!user) {
//       return res.status(404).send()
//     }
//     res.send(user)
//   } catch (error) {
//     res.status(500).send()
//   }
// })
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id)
    // if (!user) {
    //   return res.status(404).send()
    // }
    await req.user.remove()
    res.send(req.user)
  } catch (error) {
    res.status(500).send()
  }
})
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
  } catch (error) {
    res.status(404).send()
  }
})
module.exports = router
