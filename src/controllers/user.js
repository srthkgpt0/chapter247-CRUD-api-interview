const UserModel = require('../models/user')
const logger = require('../utility/logger')
const bcrypt = require('bcryptjs')
const excel = require('exceljs')
const response = require('../utility/response')
const csv = require('csvtojson')

var fs = require('fs')

// async function addUser(req, res) {
//   try {
//     req.body.photo = req.file.path
//     const user = new UserModel(req.body)
//     await user.save()
//     const token = await user.generateToken()
//     response.responseHandler(res, { token })
//   } catch (error) {
//     response.errorHandler('addUser', error, res)
//   }
// }
async function addUser(req, res) {
  try {
    const user = new UserModel(req.body)
    await user.save()
    const token = await user.generateToken()
    response.responseHandler(res, { token })
  } catch (error) {
    response.errorHandler('addUser', error, res)
  }
}
async function addPhoto(req, res) {
  try {
    req.user.photo = req.file.buffer
    await req.user.save()
  } catch (error) {}
}
async function importCsv(req, res) {
  try {
    csv()
      .fromFile(req.file.path)
      .then(async (jsonObj) => {
        // const user = new UserModel(jsonObj);
        await UserModel.insertMany(jsonObj)
      })
    response.responseHandler(res, 'Saved')
  } catch (error) {
    response.errorHandler('importCsv', error, res)
  }
}

async function csvExport(req, res) {
  try {
    const userList = await UserModel.find({})
    let workbook = new excel.Workbook()
    let worksheet = workbook.addWorksheet('Users List')
    worksheet.columns = [
      {
        header: 'Name',
        key: 'name',
        width: 30
      },
      {
        header: 'Age',
        key: 'age',
        width: 10
      },
      {
        header: 'Email Address',
        key: 'email',
        width: 40
      },
      {
        header: 'Gender',
        key: 'gender',
        width: 20
      },
      {
        header: 'Country',
        key: 'country',
        width: 30
      },
      {
        header: 'State',
        key: 'state',
        width: 30
      },
      {
        header: 'City',
        key: 'city',
        width: 30
      },
      {
        header: 'Code',
        key: 'prefix',
        width: 10
      },
      {
        header: 'Phone Number',
        key: 'phone',
        width: 40
      },
      {
        header: 'Date of birth',
        key: 'dob',
        width: 30
      },
      {
        header: 'Skills',
        key: 'skills',
        width: 40
      }
    ]
    worksheet.addRows(userList)
    await workbook.xlsx.writeFile('UserList.xlsx')
    response.responseHandler(
      res,
      null,
      'File exported successfully in the folder'
    )
  } catch (error) {
    response.errorHandler('exportCSV', error, res)
  }
}

async function getToken(req, res) {
  try {
    const user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      throw 'User not exists'
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password)
    if (!isMatch) {
      throw 'Email/Password Mismatch'
    }
    const token = await user.generateToken()
    response.responseHandler(res, { user, token })
  } catch (error) {
    response.errorHandler('getToken', error, res)
  }
}

async function getUser(req, res) {
  try {
    const user = await UserModel.find({})
    response.responseHandler(res, user)
  } catch (error) {}
}
async function updateProfile(req, res) {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    )
    if (!isValidOperation) {
      throw 'Invalid Updates!'
    }
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()
    response.responseHandler(res, req.user)
  } catch (error) {
    response.errorHandler('updateProfile', error, res)
  }
}

async function deleteUser(req, res) {
  try {
    const user = await UserModel.findByIdAndDelete(req.user._id)
    if (!user) {
      return res.status(404).send()
    }
    await req.user.remove()
    response.responseHandler(res, req.user)
  } catch (error) {
    response.errorHandler('deleteUser', error, res)
  }
}

module.exports = {
  addUser,
  getToken,
  updateProfile,
  getUser,
  deleteUser,
  csvExport,
  importCsv,
  addPhoto
}
